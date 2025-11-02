/// <reference types="astro/client" />
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db/database.types';
import type { DTO } from './types';

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user?: DTO.UserResponse;
    session?: {
      accessToken: string;
      refreshToken: string;
    };
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly PUBLIC_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}