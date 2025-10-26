import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import type { Database } from '../src/db/database.types';

// Load environment variables from .env file
config();

// For scripts running in Node.js, we use process.env instead of import.meta.env
const supabaseUrl = process.env.SUPABASE_URL;
// Use SERVICE_ROLE_KEY for seeding (bypasses RLS), fallback to SUPABASE_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) in your .env file.'
  );
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

