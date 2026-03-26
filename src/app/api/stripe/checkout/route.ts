import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import Stripe from 'stripe';



export async function POST(req: Request) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_dummy_key_for_build', {
            apiVersion: '2025-11-17.clover' as any,
        });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { tier } = await req.json();

        const priceMap: Record<string, string | undefined> = {
            starter: process.env.STRIPE_PRICE_STARTER,
            pro: process.env.STRIPE_PRICE_PRO,
            unlimited: process.env.STRIPE_PRICE_UNLIMITED,
        };

        const priceId = priceMap[tier];
        if (!priceId) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        const isSubscription = tier === 'unlimited';

        const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://gendotcom.vercel.app';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: isSubscription ? 'subscription' : 'payment',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${origin}/?payment=success`,
            cancel_url: `${origin}/?payment=cancelled`,
            metadata: {
                user_id: user.id,
                tier,
            },
            client_reference_id: user.id,
            customer_email: user.email ?? undefined,
        });

        if (!session.url) {
            return NextResponse.json({ error: 'No checkout URL returned from Stripe' }, { status: 500 });
        }

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('[Stripe Checkout Error]', err?.message, err?.raw ?? '');
        return NextResponse.json({ error: err?.message || 'Stripe checkout failed' }, { status: 500 });
    }
}

