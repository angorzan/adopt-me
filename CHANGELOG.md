# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-26

### Added
- **Database**: Supabase integration with PostgreSQL database
  - Tables: `dogs`, `shelters`, `users`, `adoption_applications`, `lifestyle_profiles`, `ai_recommendations`
  - Row Level Security (RLS) policies
  - NUMERIC type for dog age (supports puppies < 1 year)
- **API Endpoints**:
  - `GET /api/v1/dogs` - List available dogs with filtering
  - `GET /api/v1/cities` - Get list of cities with available dogs
  - Support for query parameters: `size`, `age_category`, `city`, `q` (search)
- **Frontend - Home Page (Dog Catalog)**:
  - Dog catalog view with grid layout
  - Dog cards with basic information
  - Filter by size (small, medium, large)
  - Filter by age category (puppy, adult, senior)
  - Filter by city (dropdown with available cities)
  - Search by dog name
  - Real-time filtering with React Query
  - Loading skeletons during data fetch
  - Error handling with user-friendly messages
- **Frontend - Dog Details Page**:
  - Dynamic routing `/dogs/[id]`
  - Detailed dog information (temperament, health, age, size)
  - Placeholders for adoption form and shelter contact
- **UI/UX Features**:
  - Dark mode with theme toggle (Moon/Sun icon)
  - Persistent theme preference in localStorage
  - System preference detection (prefers-color-scheme)
  - FOUC (Flash of Unstyled Content) prevention
  - Responsive design (mobile, tablet, desktop)
  - shadcn/ui component library integration
  - Tailwind CSS v4
- **Development Tools**:
  - Database seeding script (`npm run seed`)
  - TypeScript with strict type checking
  - ESLint + Prettier configuration
  - Sample data: 20 dogs in 6 shelters across Polish cities

### Fixed
- React Query context issue with Astro islands (`client:only` directive)
- SSR fetch errors in dog details page (using direct Supabase client)
- Search functionality (simplified to dog name only, avoiding nested relation issues)
- IDE settings cleanup (`.vscode/` properly gitignored)

### Technical
- **Stack**: Astro 5, React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: TanStack React Query v5
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Node.js adapter (SSR enabled)

### Data
- 20 dogs across 6 shelters
- Cities: Warszawa, Kraków, Gdańsk, Wrocław, Poznań, Łódź
- Age distribution: 5 puppies, 10 adults, 5 seniors
- Size distribution: small, medium, large

## [Unreleased]

### Planned Features
- User authentication and authorization
- Lifestyle profile questionnaire
- AI-powered dog recommendations
- Adoption application form
- Application management for shelters
- Email notifications
- Advanced search with multiple criteria
- Dog image upload and gallery
- Shelter dashboard
- User profile management

---

## Version History

- **0.1.0** (2025-10-26) - Initial MVP release with dog catalog and filtering

