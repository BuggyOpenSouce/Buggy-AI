import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function syncUserData(uid: string, data: any) {
  try {
    const { error: deleteError } = await supabase
      .from('user_data')
      .delete()
      .eq('uid', uid);

    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase
      .from('user_data')
      .insert([
        {
          uid,
          data,
          last_synced: new Date().toISOString()
        }
      ]);

    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error('Error syncing data:', error);
    return false;
  }
}

export async function getUserData(uid: string) {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('uid', uid)
      .single();

    if (error) throw error;
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}