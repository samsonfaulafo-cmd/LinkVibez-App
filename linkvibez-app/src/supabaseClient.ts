import { createClient } from '@supabase/supabase-js';

// Replace the text inside the quotes with the keys you just copied
const supabaseUrl = 'https://hzgowtryegoxjrmgmwra.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_npm0cN7Liqooac1N-EpK4w_p3Ek9L1R';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);