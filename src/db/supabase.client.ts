import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY in your .env file.'
  );
}

// Temporary constant for development, remove when auth is implemented
export const DEFAULT_USER_ID = crypto.createHash('md5').update('default_adopter').digest('hex');

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabaseClient;