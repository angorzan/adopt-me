# AdoptMe

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/angorzan/10x-project-adopt-me)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> Streamlining dog adoption in Poland 🐕

## Table of Contents
1. [Project Description](#project-description)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started Locally](#getting-started-locally)
5. [Available Scripts](#available-scripts)
6. [Project Scope](#project-scope)
7. [Project Status](#project-status)
8. [License](#license)

## Project Description
AdoptMe is a web application that streamlines dog adoption in Poland. It connects potential adopters with shelters, provides a transparent application process, and educates users on responsible adoption. The MVP focuses on user registration, lifestyle profiling, a searchable dog catalog, adoption applications, and basic shelter workflow management.

## Features

### ✅ Currently Available (v0.1.0)
- **👤 User Authentication**
  - User registration with email
  - Email verification (auto-confirmed in MVP)
  - Secure login/logout with session management
  - Role-based access (adopter, shelter_staff, admin)
- 🐕 **Dog Catalog** - Browse 20+ dogs from 6 shelters across Poland
- 🔍 **Advanced Filtering**:
  - By size (small, medium, large)
  - By age category (puppy, adult, senior)
  - By city (dropdown with available locations)
  - By name (real-time search)
- 📄 **Dog Details Page** - View comprehensive information about each dog
- 📋 **Adoption Application Form** - Submit adoption applications with lifestyle details
- 🌓 **Dark Mode** - Toggle between light and dark themes with persistent preference
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- ⚡ **Fast Loading** - Skeleton loaders and optimized data fetching
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS

### 🚧 Coming Soon
- 🧠 AI-powered dog recommendations
- 🏢 Shelter management dashboard
- 📧 Email notifications
- 📊 Application tracking
- 👤 User profiles and profile editing
- 📱 My applications page

## Tech Stack
- **Astro 5** – Static-first framework powering the UI
- **React 19** – Islands of interactivity inside Astro pages
- **TypeScript 5** – Typed JavaScript for reliability
- **Tailwind CSS 4** & **shadcn/ui** – Rapid UI development
- **Supabase** – PostgreSQL database, authentication, and edge functions
- **Node.js 22 (≥22.14.0)** – Runtime environment
- **ESLint / Prettier** – Linting & formatting

## Getting Started Locally
Prerequisites:
- Node.js 22.14.0 or later
- npm (v10+)
- Supabase project with database initialized

### Setup Steps
```bash
# clone repository
git clone https://github.com/angorzan/10x-project-adopt-me.git
cd adoptme

# install dependencies
npm install

# configure environment variables
# Create .env file with your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-anon-key
# PUBLIC_APP_URL=http://localhost:4323
```

### Configuration
1. **Supabase Setup:**
   - Create a Supabase project at https://supabase.com
   - Apply migrations from `supabase/migrations/`
   - Disable email confirmation requirement (Settings → Auth → Email Confirmations Required: OFF)
   - Add redirect URL in Settings → Auth → Redirect URLs: `http://localhost:4323`

2. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and anonymous key
   - Set `PUBLIC_APP_URL=http://localhost:4323`

### Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:4323/` (or next available port if 4323 is in use).

### Building for Production
```bash
npm run build
```
The static output will be generated in `dist/`.

## Available Scripts
| Script | Purpose |
| ------ | ------- |
| `dev` | Start Astro in development mode with live reload |
| `build` | Generate a production build |
| `preview` | Preview the production build locally |
| `seed` | Populate database with sample dog and shelter data |
| `astro` | Expose Astro CLI |
| `lint` | Lint all source files |
| `lint:fix` | Lint and automatically fix issues |
| `format` | Run Prettier on the entire codebase |

### Database Setup
```bash
# Populate the database with sample data (20 dogs, 6 shelters)
npm run seed
```

## Project Scope
### MVP (first 2 weeks)
1. User registration & email verification (GDPR-compliant)
2. Basic lifestyle profile
3. Dog catalog sourced from `data/dogs.json`
4. Filtering & search (size, age, name, city)
5. Adoption application form & immutable submissions
6. Shelter panel to manage application statuses
7. Lightweight AI recommendation (single suggestion)

### Post-MVP
- Extended profiles & edit history
- Notification system (email & in-app)
- Data quality tools for dog profiles
- Weekly reports and 30-day post-adoption surveys
- Accessibility improvements & 2FA

## Project Status

**Current Version:** 0.1.0 (MVP Phase)

**Completed:**
- ✅ Database schema and Supabase integration with RLS policies
- ✅ User registration endpoint with email validation
- ✅ User login/logout with session management
- ✅ Email verification flow (auto-confirmed in MVP)
- ✅ Authentication middleware for session management
- ✅ Dog catalog with filtering and search
- ✅ Dog details page with dynamic routing
- ✅ Adoption application form and submission
- ✅ Dark mode implementation
- ✅ Responsive design
- ✅ Data seeding script
- ✅ Role-based UI (adopter, shelter_staff, admin)

**In Progress:**
- 🚧 AI recommendations
- 🚧 Shelter management dashboard
- 🚧 Application status tracking

**Roadmap:**
- Q1 2025: AI recommendations, shelter dashboard
- Q2 2025: Email notifications, advanced search
- Q3 2025: User profiles, application history
- Q4 2025: Post-adoption surveys, reporting

For detailed changes, see [CHANGELOG.md](CHANGELOG.md).

## Important Notes

### Database Fixes Applied (v0.1.0)
- Fixed RLS (Row Level Security) policies that caused infinite recursion in user queries
- Fixed trigger `handle_new_user` to properly create user records on Supabase Auth signup
- Implemented middleware for session management and user context
- Email verification auto-confirmation enabled for MVP (can be disabled in Supabase settings)

### Known Issues
- Email verification currently auto-confirms in MVP phase (for faster testing)
- Admin dashboard and shelter staff features coming soon

### Development Tips
- Dev server runs on port 4323 (configurable if needed)
- All API endpoints are in `/src/pages/api/v1/`
- Authentication is handled via Supabase Auth + custom session middleware
- Database migrations should be applied before running the app

## License
Distributed under the MIT License. See `LICENSE` for more information.
