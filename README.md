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
- 🐕 **Dog Catalog** - Browse 20+ dogs from 6 shelters across Poland
- 🔍 **Advanced Filtering**:
  - By size (small, medium, large)
  - By age category (puppy, adult, senior)
  - By city (dropdown with available locations)
  - By name (real-time search)
- 📄 **Dog Details Page** - View comprehensive information about each dog
- 🌓 **Dark Mode** - Toggle between light and dark themes with persistent preference
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- ⚡ **Fast Loading** - Skeleton loaders and optimized data fetching
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS

### 🚧 Coming Soon
- 👤 User authentication and profiles
- 📋 Adoption application form
- 🧠 AI-powered dog recommendations
- 🏢 Shelter management dashboard
- 📧 Email notifications
- 📊 Application tracking

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

```bash
# clone repository
git clone https://github.com/angorzan/10x-project-adopt-me.git
cd adoptme

# install dependencies
npm install

# start development server
npm run dev
```
The app will be available at `http://localhost:3000/` by default.

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
- ✅ Database schema and Supabase integration
- ✅ Dog catalog with filtering and search
- ✅ Dog details page
- ✅ Dark mode implementation
- ✅ Responsive design
- ✅ Data seeding script

**In Progress:**
- 🚧 User authentication
- 🚧 Adoption application form
- 🚧 AI recommendations

**Roadmap:**
- Q1 2025: User authentication, adoption applications
- Q2 2025: Shelter management dashboard, notifications
- Q3 2025: AI recommendations, advanced search
- Q4 2025: Post-adoption surveys, reporting

For detailed changes, see [CHANGELOG.md](CHANGELOG.md).

## License
Distributed under the MIT License. See `LICENSE` for more information.
