// Test file to debug Supabase connection
import { getSupabase } from './lib/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    const supabase = getSupabase();
    console.log('Supabase client created:', !!supabase);
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').single();
    console.log('Connection test:', { data, error });
    
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth session:', { authData, authError });
    
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

// Run test
testConnection();
