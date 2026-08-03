import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'
import { processInviteBonus } from '../../../utils/invite'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const tier = searchParams.get('tier')
    const inviteCode = searchParams.get('invite_code')

    let target = searchParams.get('next') ?? '/'
    if (tier && ['starter', 'pro', 'unlimited'].includes(tier)) {
        target = `/?checkout_tier=${tier}`
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const codeToUse = inviteCode || user.user_metadata?.invite_code
                if (codeToUse) {
                    await processInviteBonus(user.id, codeToUse)
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${target}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${target}`)
            } else {
                return NextResponse.redirect(`${origin}${target}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?message=Auth error`)
}
