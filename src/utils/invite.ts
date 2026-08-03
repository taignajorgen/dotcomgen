import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function processInviteBonus(userId: string, inviteCode?: string) {
    const cleanCode = (inviteCode || '').trim().toUpperCase();
    if (cleanCode !== 'RUUM') {
        return false;
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!user) return false;

        const userMeta = user.user_metadata || {};
        if (userMeta.redeemed_ruum) {
            return false;
        }

        // Add 50 credits to user_credits
        const { data: existingCredits } = await supabaseAdmin
            .from('user_credits')
            .select('credits_remaining')
            .eq('user_id', userId)
            .maybeSingle();

        if (existingCredits) {
            const currentCredits = existingCredits.credits_remaining || 0;
            await supabaseAdmin
                .from('user_credits')
                .update({
                    credits_remaining: currentCredits + 50,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
        } else {
            await supabaseAdmin
                .from('user_credits')
                .insert({
                    user_id: userId,
                    credits_remaining: 50,
                });
        }

        // Mark as redeemed in user_metadata
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...userMeta,
                redeemed_ruum: true,
                invite_code_used: 'RUUM',
            }
        });

        return true;
    } catch (err) {
        console.error('Error processing invite bonus for user:', userId, err);
        return false;
    }
}
