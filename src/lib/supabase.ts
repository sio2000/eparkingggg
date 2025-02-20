import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Λείπουν οι μεταβλητές περιβάλλοντος του Supabase');
}

// Προσθήκη logging για debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Initializing Supabase client...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Έλεγχος της σύνδεσης
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user);
}); 