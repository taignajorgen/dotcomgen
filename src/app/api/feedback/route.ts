import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { category, message, email } = body || {};

        if (!category || !message || !message.trim()) {
            return NextResponse.json({ error: 'Please select a category and provide your feedback message.' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const userEmail = email?.trim() || user?.email || null;
        const userId = user?.id || null;

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Record feedback in database
        const { error } = await supabaseAdmin
            .from('user_feedback')
            .insert({
                category: category.trim(),
                message: message.trim(),
                email: userEmail,
                user_id: userId,
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.warn('[FEEDBACK STORE NOTICE]: user_feedback table insert returned:', error.message);
            // Fallback log for admin monitoring
            console.log('[USER FEEDBACK SUBMISSION]:', JSON.stringify({
                category,
                message,
                email: userEmail,
                userId,
                timestamp: new Date().toISOString(),
            }));
        }

        return NextResponse.json({
            success: true,
            message: 'Thank you for your feedback! We appreciate your input.',
        });
    } catch (err: any) {
        console.error('Feedback API error:', err);
        return NextResponse.json({ error: 'Failed to submit feedback. Please try again.' }, { status: 500 });
    }
}
