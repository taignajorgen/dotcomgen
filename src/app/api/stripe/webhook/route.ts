import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';



// Use service role key to bypass RLS — this runs server-side only, never exposed to clients
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CREDIT_MAP: Record<string, number> = {
    starter: 50,
    pro: 150,
};

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_dummy_key_for_build', {
        apiVersion: '2025-11-17.clover' as any,
    });

    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const tier = session.metadata?.tier;

        if (!userId || !tier) {
            console.error('Missing metadata in checkout session');
            return NextResponse.json({ received: true });
        }

        if (tier === 'unlimited') {
            // Set unlimited for 30 days
            const unlimitedUntil = new Date();
            unlimitedUntil.setDate(unlimitedUntil.getDate() + 30);

            const { error } = await supabase
                .from('user_credits')
                .upsert({
                    user_id: userId,
                    unlimited_until: unlimitedUntil.toISOString(),
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

            if (error) console.error('Error setting unlimited:', error);
        } else {
            const creditsToAdd = CREDIT_MAP[tier] || 0;

            // First, try to get existing credits
            const { data: existing } = await supabase
                .from('user_credits')
                .select('credits_remaining')
                .eq('user_id', userId)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('user_credits')
                    .update({
                        credits_remaining: existing.credits_remaining + creditsToAdd,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', userId);

                if (error) console.error('Error updating credits:', error);
            } else {
                const { error } = await supabase
                    .from('user_credits')
                    .insert({
                        user_id: userId,
                        credits_remaining: creditsToAdd,
                    });

                if (error) console.error('Error inserting credits:', error);
            }
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        // Find the user from the subscription's metadata
        const userId = subscription.metadata?.user_id;

        if (userId) {
            await supabase
                .from('user_credits')
                .update({
                    unlimited_until: null,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
        }
    }

    return NextResponse.json({ received: true });
}
