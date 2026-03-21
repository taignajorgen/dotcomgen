import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

export async function POST(req: Request) {
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

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: isSubscription ? 'subscription' : 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?payment=success`,
        cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?payment=cancelled`,
        metadata: {
            user_id: user.id,
            tier,
        },
        client_reference_id: user.id,
        customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
}
