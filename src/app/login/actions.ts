'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { processInviteBonus } from '../../utils/invite'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const tier = formData.get('tier') as string
    const inviteCode = formData.get('invite_code') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        redirect(`/login?message=Could not authenticate user${tier ? `&tier=${tier}` : ''}${inviteCode ? `&invite_code=${encodeURIComponent(inviteCode)}` : ''}`)
    }

    revalidatePath('/', 'layout')
    if (tier && ['starter', 'pro', 'unlimited'].includes(tier)) {
        redirect(`/?checkout_tier=${tier}`)
    }
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const tier = formData.get('tier') as string
    const inviteCode = (formData.get('invite_code') as string || '').trim().toUpperCase()

    const { error, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                invite_code: inviteCode
            }
        }
    })

    if (error) {
        redirect(`/login?mode=signup&message=${encodeURIComponent(error.message)}${tier ? `&tier=${tier}` : ''}${inviteCode ? `&invite_code=${encodeURIComponent(inviteCode)}` : ''}`)
    }

    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        redirect(`/login?mode=signup&message=Email already in use${tier ? `&tier=${tier}` : ''}${inviteCode ? `&invite_code=${encodeURIComponent(inviteCode)}` : ''}`)
    }

    if (authData.user) {
        await processInviteBonus(authData.user.id, inviteCode)
    }

    if (!authData.session && authData.user) {
        redirect('/login?message=Success! Check your email for a confirmation link to complete sign up.')
    }

    revalidatePath('/', 'layout')
    if (tier && ['starter', 'pro', 'unlimited'].includes(tier)) {
        redirect(`/?checkout_tier=${tier}`)
    }
    redirect('/')
}
