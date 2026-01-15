# Social Battery

A web app that lets users set and share their "social battery" level - a visual indicator of their current energy for social interaction.

## Features

- **5-Level Battery Indicator** - Set your social energy from Empty to Full with expressive faces
- **30 Status Presets** - Quick-select options like "Recharging", "Open to plans", "Need space"
- **Custom Status** - Write your own status (max 30 characters)
- **Public Profile** - Shareable URL at `socialbattery.app/username`
- **Freshness Indicator** - Shows how recent the battery update is
- **Downloadable Stickers** - Square (1:1) and Story (9:16) formats for messaging apps
- **Dynamic OG Images** - Auto-generated previews when sharing links
- **Dark Mode** - System preference detection + manual toggle
- **Settings** - Control profile visibility (public/unlisted) and theme
- **Accessible** - Keyboard navigation, ARIA labels, screen reader support

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** NextAuth.js v5 with magic link (Resend)
- **Database:** Neon Postgres with Drizzle ORM
- **Images:** Vercel OG (Satori)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest + React Testing Library

## Security

- **Rate Limiting** - All API endpoints are rate-limited to prevent abuse
- **Security Headers** - CSP, HSTS, X-Frame-Options, and more via next.config.ts
- **Input Validation** - All user inputs validated and sanitized
- **Visibility Enforcement** - Unlisted profiles hidden from OG/sticker generation
- **Parameterized Queries** - Drizzle ORM prevents SQL injection

## SEO & Performance

- **Dynamic Sitemap** - Auto-generated sitemap.xml with public profiles
- **Robots.txt** - Search engine crawl rules
- **JSON-LD Structured Data** - Rich snippets for profiles
- **Canonical URLs** - Prevent duplicate content issues
- **API Caching** - Cache-Control headers for OG/sticker routes
- **Database Indexes** - Optimized queries for visibility and timestamps
- **Error Boundaries** - Graceful error handling with retry capability
- **Environment Validation** - Startup checks for required config
- **Health Check Endpoint** - `/api/health` for monitoring

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon database
- A Resend account with verified domain

### Environment Variables

Create a `.env.local` file:

```env
POSTGRES_URL=<neon-connection-string>
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
AUTH_RESEND_KEY=<resend-api-key>
NEXTAUTH_URL=http://localhost:3000
```

### Installation

```bash
npm install
npm run db:push  # Push schema to database
npm run dev      # Start dev server
```

Open [http://localhost:3000](http://localhost:3000)

### Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:ui       # Browser UI
npm run test:coverage # Coverage report
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage with interactive demo
│   ├── sitemap.ts                  # Dynamic sitemap generation
│   ├── not-found.tsx               # Custom 404 page
│   ├── dashboard/
│   │   ├── page.tsx                # Battery controls, sharing
│   │   └── error.tsx               # Error boundary
│   ├── settings/
│   │   ├── page.tsx                # Visibility, theme controls
│   │   └── error.tsx               # Error boundary
│   ├── [username]/
│   │   ├── page.tsx                # Public profile (SSR)
│   │   ├── ProfileClient.tsx       # Share button, actions
│   │   └── error.tsx               # Error boundary
│   └── api/
│       ├── battery/                # Update battery level/status
│       ├── settings/               # Update visibility/theme
│       ├── health/                 # Health check endpoint
│       ├── og/[username]/          # Dynamic OG images
│       └── sticker/[username]/     # Downloadable stickers
├── components/
│   ├── Battery.tsx                 # Battery component with faces
│   ├── Battery.test.tsx            # Component tests
│   ├── Toast.tsx                   # Notification component
│   └── ThemeProvider.tsx           # Dark mode context
├── test/
│   ├── setup.ts                    # Test setup and mocks
│   └── utils.tsx                   # Custom render utilities
└── lib/
    ├── auth.ts                     # NextAuth configuration
    ├── constants.ts                # 30 status presets
    ├── constants.test.ts           # Constants tests
    ├── validation.test.ts          # Validation tests
    ├── env.ts                      # Environment validation
    ├── rate-limit.ts               # API rate limiting
    └── db/                         # Drizzle schema and client
```

## API Routes

| Route | Method | Rate Limit | Cache | Description |
|-------|--------|------------|-------|-------------|
| `/api/battery` | PATCH | 30/min | - | Update battery level and status |
| `/api/settings` | PATCH | 10/min | - | Update visibility and theme |
| `/api/og/[username]` | GET | 60/min | 1hr | Generate OG image |
| `/api/sticker/[username]` | GET | 30/min | 1hr | Generate sticker image |
| `/api/username/check` | GET | 30/min | 5min | Check username availability |
| `/api/username/claim` | POST | 5/hour | - | Claim a username |
| `/api/health` | GET | - | - | Health check for monitoring |

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set environment variables in the Vercel dashboard.

## License

MIT
