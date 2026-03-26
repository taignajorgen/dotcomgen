import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

const ADMIN_EMAILS = ['jerome.langvist@gmail.com', 'kontaktiere.mich@pm.me'];

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ status: 'unauthenticated', canGenerate: false, remaining: 0 });
    }

    // Admin bypass
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ status: 'admin', canGenerate: true, remaining: Infinity });
    }

    // Check paid credits
    const { data: credits } = await supabase
        .from('user_credits')
        .select('credits_remaining, unlimited_until')
        .eq('user_id', user.id)
        .single();

    if (credits?.unlimited_until && new Date(credits.unlimited_until) > new Date()) {
        return NextResponse.json({ status: 'unlimited', canGenerate: true, remaining: Infinity });
    }

    if (credits?.credits_remaining && credits.credits_remaining > 0) {
        return NextResponse.json({ status: 'paid', canGenerate: true, remaining: credits.credits_remaining });
    }

    // Free tier: count today's generations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
        .from('generation_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString());

    const usedToday = count || 0;
    const remaining = Math.max(0, 3 - usedToday);

    return NextResponse.json({
        status: remaining > 0 ? 'free' : 'exhausted',
        canGenerate: remaining > 0,
        remaining,
    });
}
