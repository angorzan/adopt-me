# UI Architecture Planning Summary - AdoptMe MVP

## Conversation Summary

### Decisions

1. **Timeline**: 1 week MVP delivery (reduced from 2 weeks)
2. **Routing Strategy**: Minimalna struktura - single-stage form flows, no complex multi-step wizards
3. **Pagination**: No pagination or infinite scroll for MVP - load all dogs at once
4. **Lifestyle Profile**: Single-page form with all required fields
5. **Error Handling**: Toast notifications only (react-hot-toast), no complex error boundaries
6. **Shelter Panel**: Single table view with status updates
7. **Accessibility**: Basic WCAG compliance (aria-labels, keyboard navigation, Tailwind contrasts)
8. **Responsive Design**: Tailwind breakpoints (sm/md/lg), mobile-first approach
9. **Data Loading**: React Query with fetch on mount, 1h cache
10. **Notifications**: Toast only - no real-time, no websockets, no push notifications
11. **AI Recommendations**: Simplified - removed from MVP due to time constraints
12. **User Feedback**: Removed post-adoption surveys from MVP
13. **Form Approach**: Single-stage forms - no multi-step wizards

### Matched Recommendations

1. **Routing Structure**
   - `/` - Dog catalog (public)
   - `/login` - Authentication
   - `/profile` - Lifestyle profile form
   - `/applications` - User's application list
   - `/shelter/*` - Shelter staff panel
   - **Rationale**: Minimal navigation reduces cognitive load and development time

2. **Form Design**
   - Single-page lifestyle profile with all fields visible
   - Inline validation with Zod
   - Submit button disabled during loading
   - **Rationale**: Reduces complexity, faster to implement

3. **Dog Catalog**
   - Grid layout: 3 columns (desktop) / 2 (tablet) / 1 (mobile)
   - Simple filters as select/checkbox above grid
   - Client-side sorting and filtering
   - Load all dogs on initial render (small dataset ~50-100 dogs)
   - **Rationale**: No backend pagination needed, instant filtering

4. **Adoption Flow**
   - "Adopt" button on dog card
   - Modal with application form (motivation + contact preference)
   - Redirect to `/applications` on success
   - **Rationale**: Streamlined UX, keeps user in context

5. **Error Handling**
   - Toast notifications for success/error (react-hot-toast)
   - Disabled submit buttons during loading
   - Simple ErrorBoundary fallback
   - **Rationale**: Minimal setup, good UX for MVP

6. **Shelter Panel**
   - Single table with applications
   - Simple actions: change status, add comment
   - Filter by status (select dropdown)
   - **Rationale**: Table component from shadcn/ui, fast to implement

7. **Accessibility**
   - Basic aria-labels on interactive elements
   - Keyboard navigation (focus states)
   - Tailwind contrast utilities
   - Alt text for dog images (when added post-MVP)
   - **Rationale**: WCAG 2.1 Level A compliance minimum

8. **Responsive Design**
   - Tailwind breakpoints: `sm:640px`, `md:768px`, `lg:1024px`
   - Stack layout on mobile, grid on desktop
   - Hamburger menu with headlessui
   - **Rationale**: Tailwind makes RWD fast to implement

9. **Data Loading**
   - React Query for API calls
   - Fetch on component mount
   - 1h cache for dog catalog
   - Loading skeletons from shadcn/ui
   - **Rationale**: Built-in caching, refetch, error handling

10. **Notifications**
    - Toast only after user actions
    - No real-time updates
    - Manual refresh on page entry
    - **Rationale**: Simplifies MVP, no websocket infrastructure needed

## UI Architecture Planning Summary

### Main Requirements

**MVP Scope (1 Week)**
- Public dog catalog with filtering
- User authentication (Supabase Auth)
- Lifestyle profile form
- Application submission flow
- Shelter staff panel for application management
- Basic error handling and loading states
- Mobile-responsive layout

**Excluded from MVP**
- AI recommendations (moved to post-MVP)
- Post-adoption surveys
- Real-time notifications
- Image uploads for dogs
- Multi-step forms
- Advanced accessibility features (2FA, screen reader optimization)

### Key Views, Screens, and User Flows

#### 1. Public Views (Unauthenticated)

**Home Page `/`**
- Hero section with CTA
- Dog catalog grid
- Filters: size (select), age_category (select), city (text search)
- Dog cards: name, age, size, temperament, shelter location
- Click card → navigate to `/dogs/:id`
- Click "Adopt" → prompt to login

**Dog Detail Page `/dogs/:id`**
- Full dog information
- Shelter contact info
- "Adopt This Dog" CTA → login required
- Back to catalog link

**Login/Register `/login`**
- Email/password form (Supabase Auth)
- Email verification required
- RODO consent checkbox
- Redirect to `/profile` after first login

#### 2. Adopter Views (Authenticated - Role: `adopter`)

**Lifestyle Profile `/profile`**
- Single-page form with fields:
  - `housing_type`: select (house/apartment)
  - `household_size`: number input (>=1)
  - `has_children`: checkbox
  - `experience_with_dogs`: radio (none/some/experienced)
  - `activity_level`: radio (low/medium/high)
  - `preferred_dog_type`: text
- Submit button disabled during API call
- Success toast + redirect to `/`
- Profile required before submitting applications

**My Applications `/applications`**
- Table/list of user's applications
- Columns: Dog Name, Shelter, Status, Submitted Date
- Click row → view application details
- No edit/cancel (per PRD)

**Application Detail `/applications/:id`**
- Dog info summary
- Application motivation
- Status badge
- Shelter comment (if any)
- Contact preference

#### 3. Shelter Staff Views (Authenticated - Role: `shelter_staff`)

**Shelter Dashboard `/shelter`**
- Redirect to `/shelter/applications`

**Applications Management `/shelter/applications`**
- Table with filters:
  - Status: select (all, new, in_progress, accepted, rejected)
- Columns: User Name, Dog Name, Submitted Date, Status
- Actions: View Details, Change Status
- Sort by submitted date (newest first)

**Application Review `/shelter/applications/:id`**
- User profile summary (lifestyle_profile)
- Dog details
- Application motivation
- Status dropdown: new → in_progress → accepted/rejected
- Comment textarea (optional)
- Save button

#### 4. User Flow Diagrams

**Adopter Flow**
```
Landing (/) → Browse Dogs → View Dog Detail → Login/Register
  → Complete Profile (/profile) → Browse Dogs → Select Dog
  → Submit Application (modal) → Success → View Applications (/applications)
```

**Shelter Staff Flow**
```
Login (/login) → Applications Table (/shelter/applications)
  → Filter/Sort → View Application → Update Status + Comment → Save
  → Back to Table
```

### API Integration and State Management

**State Management Strategy**
- **React Query** for server state (API calls)
  - Cache time: 1 hour for dogs catalog
  - Stale time: 5 minutes for applications
  - Automatic refetch on window focus
- **React Context** for auth state (Supabase session)
- **Local component state** for forms (React Hook Form + Zod)

**API Integration Points**

| View | Endpoint | Method | Query Key |
|------|----------|--------|-----------|
| Dog Catalog | `/api/v1/dogs` | GET | `['dogs', filters]` |
| Dog Detail | `/api/v1/dogs/:id` | GET | `['dogs', id]` |
| Lifestyle Profile | `/api/v1/lifestyle-profile` | GET/PUT | `['lifestyle-profile']` |
| Submit Application | `/api/v1/applications` | POST | invalidates `['applications']` |
| My Applications | `/api/v1/applications/me` | GET | `['applications', 'me']` |
| Shelter Applications | `/api/v1/applications` | GET | `['applications', 'shelter', filters]` |
| Update Application | `/api/v1/applications/:id` | PATCH | invalidates `['applications']` |

**Data Flow Example: Submit Application**
1. User clicks "Adopt" on dog card
2. Modal opens with form
3. React Hook Form validates input (Zod schema)
4. On submit: React Query mutation → `POST /api/v1/applications`
5. Success: invalidate `['applications']` cache, show toast, close modal
6. Error: show toast with error message

### Security and Authentication

**Auth Strategy**
- Supabase Auth JWT stored in httpOnly cookie
- Middleware checks `context.locals.supabase.auth.getUser()`
- Protected routes redirect to `/login` if unauthenticated
- Role-based UI rendering (hide shelter panel for adopters)

**UI Security Considerations**
- Never expose sensitive data in client state
- RLS policies enforce backend access control
- CSRF protection via Supabase session
- Input sanitization via Zod validation
- Rate limiting handled by Supabase quotas

**Role-Based UI**
```typescript
if (user.role === 'shelter_staff') {
  // Show shelter panel link in nav
  // Render shelter routes
}
if (user.role === 'adopter') {
  // Show profile + applications links
  // Hide admin features
}
```

### Responsiveness and Accessibility

**Responsive Design**
- Mobile-first approach with Tailwind
- Breakpoints:
  - `sm`: 640px (tablet)
  - `md`: 768px (desktop)
  - `lg`: 1024px (wide desktop)
- Dog catalog:
  - Mobile: 1 column stack
  - Tablet: 2 columns grid
  - Desktop: 3 columns grid
- Navigation:
  - Mobile: Hamburger menu (headlessui Dialog)
  - Desktop: Horizontal nav bar
- Tables:
  - Mobile: Card layout with stacked fields
  - Desktop: Full table with columns

**Accessibility**
- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ARIA labels on interactive elements
- Keyboard navigation (Tab, Enter, Esc)
- Focus states (Tailwind `focus:ring-2`)
- Color contrast: WCAG AA (Tailwind default palette)
- Form labels explicitly linked to inputs
- Error messages announced via `aria-live="polite"`

### Component Structure

**Planned Components**

```
/src/components
├── layout
│   ├── Header.tsx          # Nav bar with auth state
│   ├── Footer.tsx
│   └── MobileMenu.tsx      # Hamburger menu
├── dogs
│   ├── DogCard.tsx         # Grid item
│   ├── DogGrid.tsx         # Grid container
│   ├── DogFilters.tsx      # Filter controls
│   └── DogDetail.tsx       # Detail view
├── applications
│   ├── ApplicationForm.tsx # Modal form
│   ├── ApplicationCard.tsx # List item
│   └── ApplicationTable.tsx # Shelter view
├── profile
│   └── LifestyleForm.tsx   # Single-page form
├── ui                      # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── skeleton.tsx
│   └── toast.tsx
└── shared
    ├── LoadingSpinner.tsx
    ├── ErrorMessage.tsx
    └── ProtectedRoute.tsx  # Auth wrapper
```

**UI Library**
- **shadcn/ui** for base components (unstyled, customizable)
- **react-hot-toast** for notifications
- **react-hook-form** for form state
- **zod** for validation
- **react-query** for API state
- **headlessui** for accessible primitives (Dialog, Menu)

### Error Handling and Loading States

**Error Handling Strategy**
- API errors: show toast with user-friendly message
- Form validation errors: inline below field
- Network errors: retry button + toast
- 404 errors: redirect to home with toast

**Loading States**
- Skeleton loaders for dog cards (shadcn/ui)
- Spinner for form submissions
- Disabled buttons during API calls
- Progress indicators for long operations

**Error Boundaries**
- Top-level ErrorBoundary catches React errors
- Fallback UI: "Something went wrong" + reload button
- Log errors to console (no external logging in MVP)

### Performance Optimization

**Caching Strategy**
- React Query cache: 1h for dogs, 5min for applications
- Supabase client caches session
- No CDN in MVP (DigitalOcean handles static assets)

**Bundle Optimization**
- Lazy load routes with `React.lazy()`
- Tree-shake unused shadcn/ui components
- Minimize Tailwind with PurgeCSS
- No images in MVP (reduces bundle size)

**API Optimization**
- Load all dogs at once (small dataset ~50-100)
- Client-side filtering/sorting (no extra API calls)
- Debounce search inputs (300ms)
- No prefetching in MVP (future: prefetch dog detail on hover)

## Unresolved Issues

1. **Dog Data Source**: Confirm whether to load from `data/dogs.json` (static) or Supabase table (dynamic). Recommendation: Start with Supabase table pre-populated from JSON for consistency with API plan.

2. **Email Verification Flow**: PRD requires email verification before login. Need to clarify UX: block login until verified, or show banner + resend email button? Recommendation: Block login, show "Check your email" page.

3. **Shelter Staff Onboarding**: How do shelter staff get accounts? Admin creates them manually? Self-registration with approval? Recommendation: Admin creates accounts manually for MVP (add staff management post-MVP).

4. **Dog Photos**: PRD excludes photos from MVP, but dog cards typically show images. Fallback: use placeholder image or dog breed icon? Recommendation: Placeholder with dog name initial.

5. **Duplicate Application Check**: Should UI prevent duplicate applications (disable "Adopt" button if already applied)? Or let API handle it? Recommendation: API returns 409 conflict, UI shows toast "You already applied for this dog."

6. **Session Expiry**: How long should Supabase sessions last? What happens on expiry? Recommendation: 1 week default, redirect to login with toast "Session expired, please log in again."

7. **Filter Persistence**: Should filters persist in URL query params or local state only? Recommendation: URL query params for shareable links (e.g., `/?size=medium&city=Warsaw`).

8. **Mobile Table View**: Applications table on mobile - use cards or horizontal scroll? Recommendation: Cards with stacked fields (better UX than scroll).

9. **Form Validation Timing**: Validate on blur, on change, or on submit only? Recommendation: On blur for individual fields, full validation on submit.

10. **Loading Initial Data**: Show loading spinner or skeleton? Recommendation: Skeleton loaders (better perceived performance).

---

**Next Steps**
1. Create detailed wireframes for each view
2. Define Zod schemas for all forms
3. Set up React Query hooks and API client
4. Implement shadcn/ui component variants
5. Build layout components (Header, Footer, MobileMenu)
6. Implement dog catalog with filtering
7. Build authentication flow
8. Create profile form
9. Implement application submission
10. Build shelter panel

**Estimated Timeline (1 Week)**
- Day 1-2: Setup + Layout + Dog Catalog
- Day 3-4: Auth + Profile + Application Flow
- Day 5-6: Shelter Panel + Testing
- Day 7: Polish + Bug Fixes + Deploy

