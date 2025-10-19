# AdoptMe

## Table of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

## Project Description
AdoptMe is a web application that streamlines dog adoption in Poland. It connects potential adopters with shelters, provides a transparent application process, and educates users on responsible adoption. The MVP focuses on user registration, lifestyle profiling, a searchable dog catalog, adoption applications, and basic shelter workflow management.

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
| `astro` | Expose Astro CLI |
| `lint` | Lint all source files |
| `lint:fix` | Lint and automatically fix issues |
| `format` | Run Prettier on the entire codebase |

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

## License
Distributed under the MIT License. See `LICENSE` for more information.
