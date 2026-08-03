import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'You must be logged in to redeem an invite code.' }, { status: 401 });
        }

        const body = await req.json();
        const rawCode = body?.code || '';
        const cleanCode = rawCode.trim().toUpperCase();

        if (!cleanCode) {
            return NextResponse.json({ error: 'Please enter an invite code.' }, { status: 400 });
        }

        if (cleanCode !== 'RUUM') {
            return NextResponse.json({ error: 'Invalid invite code. Please check and try again.' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch fresh user data to inspect user_metadata
        const { data: { user: adminUser } } = await supabaseAdmin.auth.admin.getUserById(user.id);
        const userMeta = adminUser?.user_metadata || {};

        if (userMeta.redeemed_ruum) {
            return NextResponse.json({
                error: 'Invite code RUUM has already been redeemed on this account.'
            }, { status: 400 });
        }

        // Add 50 credits to user_credits table
        const { data: existingCredits } = await supabaseAdmin
            .from('user_credits')
            .select('credits_remaining')
            .eq('user_id', user.id)
            .maybeSingle();

        if (existingCredits) {
            const currentCredits = existingCredits.credits_remaining || 0;
            const { error: updateError } = await supabaseAdmin
                .from('user_credits')
                .update({
                    credits_remaining: currentCredits + 50,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

            if (updateError) {
                console.error('Failed to update credits:', updateError);
                return NextResponse.json({ error: 'Failed to apply credits. Please try again.' }, { status: 500 });
            }
        } else {
            const { error: insertError } = await supabaseAdmin
                .from('user_credits')
                .insert({
                    user_id: user.id,
                    credits_remaining: 50,
                });

            if (insertError) {
                console.error('Failed to insert credits:', insertError);
                return NextResponse.json({ error: 'Failed to apply credits. Please try again.' }, { status: 500 });
            }
        }

        // Mark as redeemed in user_metadata
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...userMeta,
                redeemed_ruum: true,
                invite_code_used: 'RUUM',
            }
        });

        return NextResponse.json({
            success: true,
            message: '🎉 Code RUUM redeemed! 50 generations added to your account.',
            creditsAdded: 50,
        });
    } catch (err: any) {
        console.error('Redeem invite error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
