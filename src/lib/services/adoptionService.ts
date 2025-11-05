import type { SupabaseClient } from '@/db/supabase.client';
import type { DTO } from '@/types';
type CreateApplicationError =
  | { error: 'dog_not_available' }
  | { error: 'duplicate_application' }
  | { error: 'server_error' };

type CreateApplicationResult =
  | { data: DTO.ApplicationResponse }
  | CreateApplicationError;

/**
 * Creates a new adoption application after validating dog availability and checking for duplicates
 * @param supabase - Supabase client instance
 * @param payload - Validated application data
 * @returns Created application or error details
 */
export async function createApplication(
  supabase: SupabaseClient,
  userId: string,
  payload: DTO.ApplicationCreateCommand,
): Promise<CreateApplicationResult> {
  // 1. Verify dog exists and is available
  const { data: dog, error: dogErr } = await supabase
    .from('dogs')
    .select('id, adoption_status')
    .eq('id', payload.dog_id)
    .single();

  if (dogErr || !dog || dog.adoption_status !== 'available') {
    return { error: 'dog_not_available' };
  }

  // 2. Check for duplicate open applications
  const { data: duplicates } = await supabase
    .from('adoption_applications')
    .select('id')
    .eq('user_id', userId)
    .eq('dog_id', payload.dog_id)
    .in('status', ['new', 'in_progress'])
    .limit(1);

  if (duplicates?.length) {
    return { error: 'duplicate_application' };
  }

  // 3. Create new application with default status
  const { data, error } = await supabase
    .from('adoption_applications')
    .insert({
      ...payload,
      user_id: userId,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create application:', error);
    return { error: 'server_error' };
  }

  return { data: data as DTO.ApplicationResponse };
}