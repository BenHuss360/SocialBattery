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

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** NextAuth.js v5 with magic link (Resend)
- **Database:** Neon Postgres with Drizzle ORM
- **Images:** Vercel OG (Satori)
- **Styling:** Tailwind CSS v4

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

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage with interactive demo
│   ├── dashboard/                  # Battery controls, sharing
│   ├── settings/                   # Visibility, theme controls
│   ├── [username]/page.tsx         # Public profile (SSR)
│   └── api/
│       ├── battery/                # Update battery level/status
│       ├── settings/               # Update visibility/theme
│       ├── og/[username]/          # Dynamic OG images
│       └── sticker/[username]/     # Downloadable stickers
├── components/
│   ├── Battery.tsx                 # Battery component with faces
│   └── ThemeProvider.tsx           # Dark mode context
└── lib/
    ├── auth.ts                     # NextAuth configuration
    ├── constants.ts                # 30 status presets
    └── db/                         # Drizzle schema and client
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/battery` | PATCH | Update battery level and status |
| `/api/settings` | PATCH | Update visibility and theme |
| `/api/og/[username]` | GET | Generate OG image |
| `/api/sticker/[username]` | GET | Generate sticker image |
| `/api/username/check` | POST | Check username availability |
| `/api/username/claim` | POST | Claim a username |

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set environment variables in the Vercel dashboard.

## License

MIT
