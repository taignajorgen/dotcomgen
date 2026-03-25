import { NextResponse } from 'next/server';
export const maxDuration = 60; // Allow function to run up to 60 seconds

import OpenAI from 'openai';
import * as whois from 'whois';
import { createClient } from '../../../utils/supabase/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-build',
});

const ADMIN_EMAIL = 'jerome.langvist@gmail.com';

// Helper: WHOIS check using the npm whois package (works in serverless environments).
async function isWhoisAvailable(domain: string): Promise<boolean> {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            console.warn(`[WHOIS TIMEOUT]: ${domain}`);
            resolve(false);
        }, 9000);

        whois.lookup(domain, (err: any, data: any) => {
            clearTimeout(timer);
            if (err) {
                console.error(`[WHOIS ERROR] ${domain}:`, err.message);
                resolve(false);
                return;
            }

            const text = (data || '').toLowerCase();

            if (text.includes('rate limit')) {
                console.warn(`[WHOIS RATE LIMIT]: ${domain}`);
                resolve(false);
                return;
            }

            if (
                text.includes('no match for') ||
                text.includes('not found') ||
                text.includes('is free') ||
                text.includes('no object found')
            ) {
                resolve(true);
                return;
            }

            if (
                text.includes('creation date:') ||
                text.includes('registrar:') ||
                text.includes('domain status:')
            ) {
                resolve(false);
                return;
            }

            resolve(false);
        });
    });
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'auth_required', message: 'Please sign up or log in to generate domains.' }, { status: 401 });
        }

        const body = await req.json();
        const { idea, similarTo } = body;

        if (!idea && !similarTo) {
            return NextResponse.json({ error: 'idea is required' }, { status: 400 });
        }

        const isAdmin = user.email === ADMIN_EMAIL;

        // Usage gate (skip for admin)
        if (!isAdmin) {
            // Check paid credits first
            const { data: credits } = await supabase
                .from('user_credits')
                .select('credits_remaining, unlimited_until')
                .eq('user_id', user.id)
                .single();

            const hasUnlimited = credits?.unlimited_until && new Date(credits.unlimited_until) > new Date();
            const hasPaidCredits = credits?.credits_remaining && credits.credits_remaining > 0;

            if (!hasUnlimited && !hasPaidCredits) {
                // Check free daily limit
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const { count } = await supabase
                    .from('generation_log')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('created_at', todayStart.toISOString());

                const usedToday = count || 0;
                if (usedToday >= 3) {
                    return NextResponse.json({
                        error: 'limit_reached',
                        message: 'You have used all 3 free daily generations. Upgrade for more!',
                    }, { status: 403 });
                }
            }

            // Decrement paid credits if applicable (and not unlimited)
            if (hasPaidCredits && !hasUnlimited) {
                await supabase
                    .from('user_credits')
                    .update({
                        credits_remaining: credits!.credits_remaining - 1,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id);
            }
        }

        // Log the generation
        await supabase.from('generation_log').insert({ user_id: user.id });

        let promptContent = `Idea: ${idea}`;
        if (similarTo) {
            promptContent = `Original Idea: ${idea || 'unknown'}\nCRITICAL: The user loves the domain name "${similarTo}". Please generate domain names that are highly similar in structure, prefix/suffix style, length, and brand vibe to "${similarTo}".`;
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert brand naming consultant. The user will give you a business idea and potentially a domain name they already like. 
Generate exactly 60 short, catchy, highly brandable domain names (WITHOUT the .com extension).
If the user provides a "similar to" domain, ensure the generated names closely mimic its rhythmic structure, tone, and cleverness.
Plain a-z letters only. Output a JSON object with a single key "names" containing an array of strings.`
                },
                {
                    role: 'user',
                    content: promptContent
                }
            ],
            response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message.content;
        if (!responseContent) throw new Error('No response from OpenAI');

        const { names } = JSON.parse(responseContent);
        const domains = names.map((n: string) => `${n.toLowerCase().replace(/[^a-z]/g, '')}.com`);
        const uniqueDomains = Array.from(new Set<string>(domains));

        // Run WHOIS checks in parallel batches with a hard 45-second budget
        const BATCH_SIZE = 5;
        const MAX_RESULTS = 10;
        const DEADLINE_MS = 45_000;
        const startTime = Date.now();
        const finalAvailableDomains: string[] = [];

        for (let i = 0; i < uniqueDomains.length; i += BATCH_SIZE) {
            if (finalAvailableDomains.length >= MAX_RESULTS) break;
            if (Date.now() - startTime > DEADLINE_MS) break;

            const batch = uniqueDomains.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(d => isWhoisAvailable(d)));

            batch.forEach((domain, idx) => {
                if (results[idx] && finalAvailableDomains.length < MAX_RESULTS) {
                    finalAvailableDomains.push(domain);
                }
            });
        }

        return NextResponse.json({
            domains: finalAvailableDomains,
            stats: {
                generated: uniqueDomains.length,
                available: finalAvailableDomains.length
            }
        });
    } catch (error: any) {
        console.error('Error in API:', error);
        return NextResponse.json({ error: error.message || 'Error occurred' }, { status: 500 });
    }
}
