/// <reference types="astro/client" />
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db/database.types';

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
  }
}