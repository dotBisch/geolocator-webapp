import { supabase } from './supabase';
import { User, HistoryItem, GeoData } from '../types';

export const supabaseService = {
  // --- Auth ---
  async login(email: string, password: string): Promise<User> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user || !data.user.email) throw new Error('No user data returned');

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email.split('@')[0],
      token: data.session?.access_token,
    };
  },

  async signUp(email: string, password: string, name?: string): Promise<User> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;
    if (!data.user || !data.user.email) throw new Error('No user data returned');

    return {
      id: data.user.id,
      email: data.user.email,
      name: name || data.user.email.split('@')[0],
      token: data.session?.access_token,
    };
  },

  async logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split('@')[0],
    };
  },

  // --- Database (History) ---
  async getHistory(): Promise<HistoryItem[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      created_at: item.created_at,
      data: item.data as GeoData, // Assuming 'data' column is JSONB
    }));
  },

  async addToHistory(geoData: GeoData): Promise<HistoryItem> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('search_history')
      .insert([
        { 
          user_id: user.id, 
          data: geoData 
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      created_at: data.created_at,
      data: data.data as GeoData,
    };
  },

  async deleteHistory(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
