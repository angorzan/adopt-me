# REST API Plan

## 1. Resources
| Resource | DB Table | Description |
|----------|----------|-------------|
| Users | `public.users` | Registered users (adopters, shelter staff, admins). |
| Shelters | `public.shelters` | Animal shelters participating in AdoptMe. |
| Dogs | `public.dogs` | Dogs available for adoption. |
| Lifestyle Profiles | `public.lifestyle_profiles` | Short lifestyle questionnaire linked 1-to-1 to a user. |
| Adoption Applications | `public.adoption_applications` | Adoption requests submitted by users for specific dogs. |
| AI Recommendations | `public.ai_recommendations` | Snapshot of AI-generated dog suggestions per user. |

## 2. Endpoints

### 2.1 Auth (handled by Supabase Auth)
Supabase provides `/auth/v1/*` routes for sign-up, sign-in, email verification, etc. Front-end will use Supabase JavaScript client; no custom backend required.

### 2.2 Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/users/me` | Return authenticated user profile. |
| PATCH | `/api/v1/users/me` | Update own email / password. Only role `admin` may update `role` or `shelter_id`. |

**Response 200**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "adopter",
  "shelter_id": "uuid|null",
  "created_at": "2025-10-21T12:00:00Z",
  "updated_at": "2025-10-21T12:00:00Z"
}
```

### 2.3 Shelters
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/shelters` | List shelters (public). Supports `?city=` filter & pagination. | none |
| POST | `/api/v1/shelters` | Create shelter (admin only). | admin |
| GET | `/api/v1/shelters/:id` | Shelter details plus aggregate counts. | none |
| PATCH | `/api/v1/shelters/:id` | Update shelter (admin). | admin |
| DELETE | `/api/v1/shelters/:id` | Remove shelter (admin). | admin |

Pagination params: `page` (default 1), `pageSize` (max 50).

### 2.4 Dogs
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/dogs` | List dogs with filters: `size`, `age_category`, `city`, `status` (default `available`), search `q` (name). Supports pagination & sorting. | none |
| POST | `/api/v1/dogs` | Create dog (shelter staff or admin). | shelter_staff/admin |
| GET | `/api/v1/dogs/:id` | Dog details. | none |
| PATCH | `/api/v1/dogs/:id` | Update dog (only owning shelter staff or admin). | shelter_staff/admin |
| DELETE | `/api/v1/dogs/:id` | Delete dog (only owning shelter staff or admin). | shelter_staff/admin |

**Dog Payload (create/update)**
```json
{
  "name": "Luna",
  "age_years": 2,
  "size": "medium",
  "temperament": "energetic, friendly",
  "health": "vaccinated",
  "adoption_status": "available"
}
```

### 2.5 Lifestyle Profiles
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/lifestyle-profile` | Retrieve current user profile (creates empty if none). | adopter |
| PUT | `/api/v1/lifestyle-profile` | Upsert profile with required fields. | adopter |

Payload validates `housing_type`, `household_size >=1`, etc.

### 2.6 Adoption Applications
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/applications` | Submit new application. Body requires `dog_id`, `motivation`, `contact_preference`. | adopter |
| GET | `/api/v1/applications/me` | List own applications. | adopter |
| GET | `/api/v1/applications` | List applications for staff’s shelter. | shelter_staff/admin |
| GET | `/api/v1/applications/:id` | Details (allowed if owner or shelter staff). | authenticated |
| PATCH | `/api/v1/applications/:id` | Update `status`, `shelter_comment` (staff/admin). | shelter_staff/admin |

### 2.7 AI Recommendations
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/recommendations` | Submit survey answers (JSON). Invokes OpenRouter, stores result in table, returns recommended dog. | adopter |
| GET | `/api/v1/recommendations/latest` | Last recommendation for user. | adopter |

**Survey Payload**
```json
{
  "answers": {
    "size_preference": "medium",
    "energy_level": "high",
    "good_with_children": true
  }
}
```

**Recommendation Response**
```json
{
  "dog": {
    "id": "uuid",
    "name": "Luna",
    "size": "medium",
    "age_category": "adult"
  }
}
```

## 3. Authentication & Authorization
- Supabase JWT (managed by Supabase Auth).
- Protect API routes in Astro using `context.locals.supabase.auth.getUser()`.
- Roles stored in `public.users.role` and reflected in JWT via Supabase “JWT custom claims” to simplify checks.
- Apply RLS (already defined) as final safety net.

## 4. Validation & Business Logic
| Resource | Validation rules |
|----------|------------------|
| Dogs | `age_years >=0`; enum checks; only shelter staff from dog’s shelter may modify. |
| Lifestyle Profiles | All fields required; one profile per user (`UNIQUE`). |
| Applications | Only status transition sequence: `new → in_progress → accepted/rejected`. Enforced in service layer. |
| AI Recommendations | Must include `survey_answers` JSON with predefined keys; verifies dog availability before persisting. |

**Business Rules Implementation**
- Status transitions controlled in handler before `update` call.
- Recommendation endpoint triggers server-side function to call OpenRouter and choose dog based on availability.
- Pagination default page size 20, max 50.
- Rate limiting via Vercel/Edge Function middleware (optional) or Supabase quotas.

## 5. Indexes
- Already defined in DB: `idx_dogs_size`, `idx_dogs_age_category`, etc., supporting list endpoints.
- Add `idx_applications_created_at` (dog_id, created_at desc) if listing by newest becomes heavy.

## 6. Error Handling
| Code | Meaning |
|------|---------|
| 400 | Validation failed (missing fields, enum mismatch) |
| 401 | Not authenticated |
| 403 | Role not authorized / RLS denied |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate profile) |
| 500 | Internal error or external AI failure |

