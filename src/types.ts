import type { Database } from './db/database.types'
import type { Enums } from './db/database.types'

export namespace DTO {
  // helpers
  type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
  type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

  // ---------------- Users ----------------
  /** Shape returned from GET /users/me */
  export type UserResponse = Pick<Row<'users'>, 'id' | 'email' | 'role' | 'shelter_id' | 'created_at' | 'updated_at'>

  /** Payload for PATCH /users/me */
  export type UserUpdateCommand = Partial<Pick<Insert<'users'>, 'email' | 'password_hash'>>

  // ---------------- Shelters ----------------
  export type ShelterResponse = Row<'shelters'>
  export type ShelterCreateCommand = Omit<Insert<'shelters'>, 'id' | 'created_at' | 'updated_at'>
  export type ShelterUpdateCommand = Partial<ShelterCreateCommand>

  // ---------------- Dogs ----------------
  export type DogResponse = Row<'dogs'>
  export type DogCreateCommand = Omit<Insert<'dogs'>, 'id' | 'created_at' | 'updated_at' | 'age_category'>
  export type DogUpdateCommand = Partial<DogCreateCommand>

  // ---------------- Lifestyle Profile ----------------
  export type LifestyleProfileResponse = Row<'lifestyle_profiles'>
  export type LifestyleProfileUpsertCommand = Omit<Insert<'lifestyle_profiles'>, 'created_at' | 'updated_at'>

  // ---------------- Adoption Applications ----------------
  export type ApplicationResponse = Row<'adoption_applications'>
  export type ApplicationCreateCommand = Omit<Insert<'adoption_applications'>, 'id' | 'status' | 'created_at' | 'updated_at' | 'shelter_comment'>
  export interface ApplicationUpdateStatusCommand {
    status: Enums<'application_status'>
    shelter_comment?: string | null
  }

  // ---------------- AI Recommendations ----------------
  export interface RecommendationResponse {
    dog: Pick<Row<'dogs'>, 'id' | 'name' | 'size' | 'age_category'>
  }
  export interface RecommendationCreateCommand {
    answers: Record<string, unknown>
  }
}
