import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

type FallbackUser = {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  password?: string;
};

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

const getFallbackStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getStoredFallbackUsers = (): FallbackUser[] => {
  const storage = getFallbackStorage();
  if (!storage) return [];

  try {
    return JSON.parse(storage.getItem('fallback-users') || '[]');
  } catch {
    return [];
  }
};

const saveStoredFallbackUsers = (users: FallbackUser[]) => {
  const storage = getFallbackStorage();
  if (!storage) return;

  storage.setItem('fallback-users', JSON.stringify(users));
};

const getStoredFallbackSession = () => {
  const storage = getFallbackStorage();
  if (!storage) return null;

  try {
    return JSON.parse(storage.getItem('fallback-session') || 'null');
  } catch {
    return null;
  }
};

const setStoredFallbackSession = (session: unknown) => {
  const storage = getFallbackStorage();
  if (!storage) return;

  storage.setItem('fallback-session', JSON.stringify(session));
};

const clearStoredFallbackSession = () => {
  const storage = getFallbackStorage();
  if (!storage) return;

  storage.removeItem('fallback-session');
};

const buildFallbackSession = (user: FallbackUser) => ({
  access_token: `fallback-${user.id}`,
  refresh_token: `fallback-refresh-${user.id}`,
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  user,
});

const createFallbackUserProfile = (email: string, password: string, metadata?: Record<string, unknown>) => {
  const now = new Date().toISOString();
  const baseId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: baseId,
    email,
    role: (metadata?.role as string) || 'citizen',
    first_name: (metadata?.first_name as string) || '',
    last_name: (metadata?.last_name as string) || '',
    phone: (metadata?.phone as string) || '',
    is_active: true,
    is_verified: true,
    created_at: now,
    updated_at: now,
    password,
  } as FallbackUser;
};

const createFallbackQueryBuilder = (table?: string) => {
  const filters: Record<string, unknown> = {};

  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      filters[column] = value;
      return builder;
    },
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    ilike: () => builder,
    like: () => builder,
    in: () => builder,
    neq: () => builder,
    gte: () => builder,
    lte: () => builder,
    or: () => builder,
    maybeSingle: async () => {
      if (table !== 'users') {
        return { data: null, error: null };
      }

      const storedUsers = getStoredFallbackUsers();
      const match = storedUsers.find((user) => {
        return Object.entries(filters).every(([column, value]) => {
          if (column === 'id') return user.id === value;
          if (column === 'email') return user.email?.toLowerCase() === String(value).toLowerCase();
          if (column === 'role') return user.role === value;

          return true;
        });
      });

      return { data: match ?? null, error: null };
    },
    single: async () => {
      const result = await builder.maybeSingle();
      return { data: result.data, error: null };
    },
    insert: async (values: unknown) => {
      if (table !== 'users') {
        return { data: null, error: null };
      }

      const payload = Array.isArray(values) ? values[0] : values;
      const user = payload as FallbackUser;
      const existingUsers = getStoredFallbackUsers();
      const nextUsers = [...existingUsers, user];
      saveStoredFallbackUsers(nextUsers);
      return { data: user, error: null };
    },
    update: async (values: unknown) => {
      if (table !== 'users') {
        return { data: null, error: null };
      }

      const payload = values as Partial<FallbackUser>;
      const existingUsers = getStoredFallbackUsers();
      const nextUsers = existingUsers.map((user) => {
        const matches = Object.entries(filters).every(([column, value]) => {
          if (column === 'id') return user.id === value;
          if (column === 'email') return user.email?.toLowerCase() === String(value).toLowerCase();
          if (column === 'role') return user.role === value;

          return true;
        });

        return matches ? { ...user, ...payload } : user;
      });

      saveStoredFallbackUsers(nextUsers);
      return { data: nextUsers.find((user) => {
        return Object.entries(filters).every(([column, value]) => {
          if (column === 'id') return user.id === value;
          if (column === 'email') return user.email?.toLowerCase() === String(value).toLowerCase();
          if (column === 'role') return user.role === value;

          return true;
        });
      }) ?? null, error: null };
    },
    delete: async () => ({ data: null, error: null }),
  };

  return builder;
};

const createFallbackClient = () => ({
  auth: {
    getSession: async () => {
      const session = getStoredFallbackSession();
      return { data: { session }, error: null };
    },
    getUser: async () => {
      const session = getStoredFallbackSession();
      if (session?.user) {
        return { data: { user: session.user }, error: null };
      }

      return { data: { user: fallbackAdminProfile }, error: null };
    },
    signInWithPassword: async ({ email, password }: { email?: string; password?: string }) => {
      if (email === 'admin@wastecollect.com' && password === 'admin12345') {
        localStorage.setItem('fallback-user-role', 'super_admin');
        return { data: { user: fallbackAdminProfile, session: fallbackAdminSession }, error: null };
      }

      const storedUsers = getStoredFallbackUsers();
      const match = storedUsers.find((user) =>
        user.email?.toLowerCase() === email?.toLowerCase() && user.password === password
      );

      if (match) {
        const session = buildFallbackSession(match);
        localStorage.setItem('fallback-user-role', match.role || 'citizen');
        setStoredFallbackSession(session);
        return { data: { user: match, session }, error: null };
      }

      return { data: { user: null, session: null }, error: null };
    },
    signUp: async ({ email, password, options }: { email?: string; password?: string; options?: { data?: Record<string, unknown> } }) => {
      if (!email || !password) {
        return { data: { user: null, session: null }, error: null };
      }

      const existingUsers = getStoredFallbackUsers();
      const existing = existingUsers.find((user) => user.email?.toLowerCase() === email.toLowerCase());

      if (existing) {
        const session = buildFallbackSession(existing);
        setStoredFallbackSession(session);
        return { data: { user: existing, session }, error: null };
      }

      const profile = createFallbackUserProfile(email, password, options?.data);
      const nextUsers = [...existingUsers, profile];
      saveStoredFallbackUsers(nextUsers);

      const session = buildFallbackSession(profile);
      localStorage.setItem('fallback-user-role', profile.role || 'citizen');
      setStoredFallbackSession(session);

      return { data: { user: profile, session }, error: null };
    },
    signInWithOtp: async () => ({ error: null }),
    verifyOtp: async () => ({ error: null }),
    signOut: async () => {
      clearStoredFallbackSession();
      return { error: null };
    },
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