# API Endpoint Implementation Plan: POST /api/v1/applications

## 1. Endpoint Overview
Creates a new adoption application for the authenticated adopter. Persists the request in `public.adoption_applications` and returns the created record.

## 2. Request Details
- **HTTP Method:** POST
- **URL Pattern:** `/api/v1/applications`
- **Auth:** `authenticated` (role `adopter`)
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <supabase_jwt>`
- **Body (DTO.ApplicationCreateCommand):**
```json
{
  "dog_id": "uuid",
  "motivation": "string (min 20 chars)",
  "contact_preference": "email | phone",
  "extra_notes": "string (optional)"
}
```

## 3. Used Types
- `DTO.ApplicationCreateCommand`
- `DTO.ApplicationResponse`

## 4. Response Details
| Code | Description | Body |
|------|-------------|------|
| 201  | Created     | `DTO.ApplicationResponse` |
| 400  | Validation error | `{ error: string }` |
| 401  | Not authenticated | `{ error: 'unauthorized' }` |
| 404  | Dog not found / unavailable | `{ error: 'dog_not_available' }` |
| 409  | Duplicate open application for same dog | `{ error: 'duplicate_application' }` |
| 500  | Server error | `{ error: 'server_error' }` |

## 5. Data Flow
1. **Middleware**: `context.locals.supabase` provides client & `auth.getUser()`.
2. **Validation**: Zod schema checks body, UUIDs, and min length.
3. **Business logic** service `adoptionService.createApplication()`:
   - Fetch dog by `dog_id`, ensure `adoption_status = 'available'`.
   - Check for existing `status IN ('new','in_progress')` apps for (user_id, dog_id).
   - Insert row with default status `new`.
4. **Return** inserted row (filtered via `select ...`) as `DTO.ApplicationResponse`.

## 6. Security Considerations
- JWT verification via Supabase helper.
- Ensure `user.role === 'adopter'` before allowing insert.
- RLS already prevents cross-tenant access; insert policy requires `user_id = auth.uid()`.
- Use Zod to sanitize strings (length, allowed chars) to avoid SQL injection in raw queries.

## 7. Error Handling
| Scenario | Code | Handling |
|----------|------|----------|
| Zod failure | 400 | return list of issues |
| Dog not `available` | 404 | message `dog_not_available` |
| Duplicate app | 409 | message `duplicate_application` |
| Supabase error | 500 | log to Sentry; return generic error |

## 8. Performance
- Index `idx_applications_user` covers duplicate check.
- Use single `insert ... select` query to avoid race conditions.

## 9. Implementation Steps
1. **Create Zod schema** `ApplicationCreateSchema` in `src/lib/validators/application.ts`.
2. **Add service** `src/lib/services/adoptionService.ts` with `createApplication()` using `SupabaseClient`.
3. **Add API route** `src/pages/api/applications.ts`:
   - `export const prerender = false;`
   - Handle POST only.
   - Use middleware for auth.
4. **Unit tests** for service with mocked Supabase.
5. **Add E2E test** calling endpoint with valid/invalid payload.

