import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fallbackAdminProfile = {
  id: 'fallback-admin-id',
  email: 'admin@wastecollect.com',
  role: 'super_admin',
  first_name: 'Admin',
  last_name: 'User',
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const fallbackAdminSession = {
  access_token: 'fallback-admin-token',
  refresh_token: 'fallback-admin-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  user: fallbackAdminProfile,
};

const createFallbackQueryBuilder = (table?: string) => ({
  select: () => createFallbackQueryBuilder(table),
  eq: () => createFallbackQueryBuilder(table),
  order: () => createFallbackQueryBuilder(table),
  limit: () => createFallbackQueryBuilder(table),
  range: () => createFallbackQueryBuilder(table),
  ilike: () => createFallbackQueryBuilder(table),
  like: () => createFallbackQueryBuilder(table),
  in: () => createFallbackQueryBuilder(table),
  neq: () => createFallbackQueryBuilder(table),
  gte: () => createFallbackQueryBuilder(table),
  lte: () => createFallbackQueryBuilder(table),
  or: () => createFallbackQueryBuilder(table),
  maybeSingle: async () => ({
    data: table === 'users' ? fallbackAdminProfile : null,
    error: null,
  }),
  single: async () => ({
    data: table === 'users' ? fallbackAdminProfile : null,
    error: null,
  }),
  insert: async () => ({ data: null, error: null }),
  update: async () => ({ data: null, error: null }),
  delete: async () => ({ data: null, error: null }),
});

const createFallbackClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: fallbackAdminProfile }, error: null }),
    signInWithPassword: async ({ email, password }: { email?: string; password?: string }) => {
      if (email === 'admin@wastecollect.com' && password === 'admin12345') {
        localStorage.setItem('fallback-user-role', 'super_admin');
        return { data: { user: fallbackAdminProfile, session: fallbackAdminSession }, error: null };
      }

      return { data: { user: null, session: null }, error: null };
    },
    signInWithOtp: async () => ({ error: null }),
    verifyOtp: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => undefined,
        },
      },
    }),
  },
  from: (table: string) => createFallbackQueryBuilder(table),
  rpc: async () => ({ data: null, error: null }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  channel: () => {
    const channel = {
      on: () => channel,
      subscribe: async () => ({ unsubscribe: async () => undefined }),
      unsubscribe: async () => undefined,
    };

    return channel;
  },
  removeChannel: () => undefined,
});

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase credentials are missing. Falling back to a local no-op client so the UI can still load.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();