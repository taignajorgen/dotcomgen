import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

// GET - Fetch all saved domains for the current user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('saved_domains')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ domains: data });
}

// POST - Save a domain
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { domain } = await req.json();

    if (!domain) {
        return NextResponse.json({ error: 'domain is required' }, { status: 400 });
    }

    // Check if already saved
    const { data: existing } = await supabase
        .from('saved_domains')
        .select('id')
        .eq('user_id', user.id)
        .eq('domain', domain)
        .single();

    if (existing) {
        return NextResponse.json({ message: 'Already saved' });
    }

    const { error } = await supabase
        .from('saved_domains')
        .insert({ user_id: user.id, domain });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Saved successfully' });
}

// DELETE - Remove a saved domain
export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { domain } = await req.json();

    const { error } = await supabase
        .from('saved_domains')
        .delete()
        .eq('user_id', user.id)
        .eq('domain', domain);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Removed successfully' });
}
