import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getProfile() {
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('members')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function updateProfile(updates) {
    const user = await getUser();
    if (!user) return { error: 'No user' };

    const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
    
    return { data, error };
}

export async function getPaymentHistory() {
    const user = await getUser();
    if (!user) return [];

    // First get member id
    const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if (!member) return [];

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', member.id)
        .order('payment_date', { ascending: false });
        
    if (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
    return data;
}

export async function requireAuth() {
    const user = await getUser();
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }
    return user;
}

export async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
}
