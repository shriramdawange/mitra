# Mitra — Personal Growth & Productivity OS

Mitra is a personal growth, productivity, and planning operating system. It combines daily goals, habits, todos,
reminders, calendar planning, learning tracking, personal development logs, and career opportunity tracking in one
place.

## Stack

- **Frontend / App**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **Database**: PostgreSQL via Drizzle ORM
- **Server state**: Next.js Server Actions + REST API routes under `/api/mitra/*`
- **Mobile**: Flutter app in [`mitra_flutter/`](./mitra_flutter) that consumes the same REST API

## Getting started

1. Copy `.env.example` to `.env` and fill in your `DATABASE_URL`.
2. Install dependencies: `npm install`
3. Start the database and run migrations (Drizzle).
4. Start the dev server: `npm run dev`

## Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm start` — start production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check

## Features

- Daily goals with progress logging and completion tracking
- Habits with idempotent daily check-ins
- To-do lists with priorities and due dates
- Calendar events with month view + day selection
- Reminders with timestamps
- Learning list with statuses
- Personal development reflections with mood tracking
- PDF / wishlist resource store
- Field opportunities with daily Hacker News update fetching

## Backend decision: Supabase

The current backend is a self-hosted PostgreSQL database accessed via Drizzle ORM.

**Verdict:** Supabase is **not strictly required** yet, but it is the **recommended backend** for where Mitra is heading
(multi-device sync via the Flutter app, authentication, realtime updates, managed database).

- The existing Drizzle schema maps 1:1 to Supabase Postgres (tables already use `snake_case` columns).
- Migration would swap the `pg` driver for `@supabase/supabase-js` (or Drizzle's Supabase driver), add auth, and enable
  realtime subscriptions for habits/goals across devices.

If you want, I can prepare the Supabase integration (auth client, realtime, schema policies) as the next step.
