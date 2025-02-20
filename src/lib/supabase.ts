import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Προσθήκη logging για debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Initializing Supabase client...');

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-client-info': 'supabase-js'
      }
    }
  }
);

// Test database connection
supabase
  .from('locations')
  .select('count')
  .single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Database connection error:', error);
    } else {
      console.log('Connected to database, locations count:', data?.count);
    }
  });

// Log auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event);
  if (session?.user) {
    console.log('Authenticated user:', {
      id: session.user.id,
      email: session.user.email
    });
  }
}); 