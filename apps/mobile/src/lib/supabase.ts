import { createClient } from '@supabase/supabase-js';

// Configuration: Read from environment or fallback to local dev endpoints
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-anon-key-dev';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealth {
  connected: boolean;
  message: string;
  url: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  try {
    const { error } = await supabase.from('admin_units').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Chưa kết nối: ${error.message}`,
        url: supabaseUrl,
      };
    }
    return {
      connected: true,
      message: 'Kết nối CSDL Supabase thành công',
      url: supabaseUrl,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Lỗi kết nối mạng: ${err?.message || 'Không thể liên lạc máy chủ'}`,
      url: supabaseUrl,
    };
  }
}
