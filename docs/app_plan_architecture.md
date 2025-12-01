# MelodyBook — Piano Attendance & Earnings App

> Single-file project plan, layout structure, and implementation guidance with best practices.

---

## Project overview

**Goal:** build a lightweight, elegant web app for piano teachers to track lessons, attendance (by hour), calculate monthly earnings, export reports, and manage student details. The app should be mobile-friendly, secure, and designed to be extended into a premium product.

**MVP scope:**
- Teacher account (single-user initially)
- Create & manage students (name, contact, hourly rate, default session length)
- Schedule lessons + calendar view
- Mark attendance (present / absent / makeup) with actual minutes/hours
- Automated monthly earnings report (per student + totals) and CSV/PDF export
- Simple payments table (manual entry)

---

## Chosen tech stack (exact)

**Frontend**
- Next.js (App Router) — TypeScript
- React — functional components + hooks
- Tailwind CSS — utility-first styling
- shadcn/ui (optional) — accessible components
- TanStack Query (React Query) — server-state & caching
- React Hook Form + Zod — forms + validation
- FullCalendar React — scheduling UI
- Recharts — charts for dashboard

**Backend / Database**
- Next.js server actions / app route handlers (TypeScript) — thin backend inside Next
- Prisma ORM — TypeScript-first ORM
- PostgreSQL — primary relational DB (use Supabase / Neon / Railway)
- Redis (Upstash or managed Redis) — cache & job queue (BullMQ)

**Auth & Storage**
- NextAuth.js (email magic links + providers) or Clerk (hosted auth)
- Supabase Storage or AWS S3 — file storage for attachments/recordings

**Jobs & Background Tasks**
- BullMQ (Node) + Redis — scheduled report generation, reminder emails

**Payments / Emails / Notifications**
- Stripe — optional, for invoicing or receiving payments
- SendGrid / Postmark — transactional emails
- Twilio — optional SMS reminders

**Hosting / Deployment**
- Vercel — Next.js frontend & edge functions
- PostgreSQL on Neon / Supabase / Railway
- Redis on Upstash / Render
- CI: GitHub Actions

**Monitoring & Observability**
- Sentry — error tracking
- Vercel Analytics / PostHog — product usage

---

## Repo & folder structure (opinionated)

```
melodybook/
├─ apps/
│  └─ web/                    # Next.js app (app router)
│     ├─ app/
│     │  ├─ layout.tsx
│     │  ├─ page.tsx
│     │  ├─ dashboard/
│     │  ├─ students/
│     │  ├─ lessons/
│     │  └─ reports/
│     ├─ components/
│     ├─ hooks/
│     ├─ lib/
│     ├─ styles/
│     └─ prisma/              # prisma client + migration scripts
├─ packages/                  # optional shared packages
├─ prisma/
│  ├─ schema.prisma
├─ scripts/
├─ .github/workflows/
├─ package.json
├─ tsconfig.json
└─ README.md
```

**Key files**
- `app/layout.tsx` — global layout, theming provider
- `app/dashboard/page.tsx` — teacher dashboard (widgets)
- `app/students/page.tsx` — student list
- `app/students/[id]/page.tsx` — student profile & attendance
- `app/lessons/page.tsx` — calendar + schedule UI
- `app/reports/page.tsx` — monthly report UI and export
- `lib/prisma.ts` — init prisma client
- `lib/auth.ts` — auth helpers & middleware
- `components/AttendanceCard.tsx` — quick mark attendance
- `components/ExportButton.tsx` — CSV/PDF export logic

---

## Database schema (Prisma) — starter

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  role        Role     @default(TEACHER)
  createdAt   DateTime @default(now())
  students    Student[]
}

enum Role { TEACHER STUDENT PARENT }

model Student {
  id                String    @id @default(cuid())
  userId            String    // the teacher who owns this student
  name              String
  email             String?
  phone             String?
  hourlyRateCents   Int       @default(0) // store money as cents
  defaultMinutes    Int       @default(60)
  notes             String?
  createdAt         DateTime  @default(now())
  lessons           Lesson[]
  payments          Payment[]
  teacher           User      @relation(fields: [userId], references: [id])
}

model Lesson {
  id            String    @id @default(cuid())
  studentId     String
  teacherId     String
  scheduledAt   DateTime
  durationMin   Int
  createdAt     DateTime  @default(now())
  attendance    Attendance?
  student       Student   @relation(fields: [studentId], references: [id])
}

model Attendance {
  id          String   @id @default(cuid())
  lessonId    String   @unique
  date        DateTime
  status      AttendanceStatus
  actualMin   Int      // actual minutes attended
  note        String?
  lesson      Lesson   @relation(fields: [lessonId], references: [id])
}

enum AttendanceStatus { PRESENT ABSENT MAKEUP }

model Payment {
  id         String   @id @default(cuid())
  studentId  String
  amountCents Int
  method     String?
  date       DateTime @default(now())
}
```

---

## API design (Next.js route handlers / REST-like)

Use `app/api/*` route handlers or server functions. Prefer typed request bodies & responses.

### Auth
- `POST /api/auth/session` (handled by NextAuth)

### Students
- `GET /api/students` — list (filter by search)
- `POST /api/students` — create
- `GET /api/students/:id` — detail
- `PUT /api/students/:id` — update
- `DELETE /api/students/:id` — delete

### Lessons & Attendance
- `GET /api/lessons?from=...&to=...` — calendar query
- `POST /api/lessons` — create lesson (support recurring param)
- `PUT /api/lessons/:id` — update
- `DELETE /api/lessons/:id` — delete
- `POST /api/attendance` — mark attendance (lessonId, status, actualMin)

### Reports
- `GET /api/reports/monthly?year=2025&month=12` — returns JSON summary
- `POST /api/reports/monthly` — request generation (enqueues job), returns job id
- `GET /api/export/csv?month=2025-12` — CSV export
- `GET /api/export/pdf?month=2025-12` — PDF export (generated via headless chrome / Puppeteer)

### Payments
- `GET /api/payments?studentId=...`
- `POST /api/payments` — record payment

---

## Frontend layout & component logic (high level)

### Layout
- `RootLayout` — theme provider, global nav (Dashboard / Students / Lessons / Reports / Settings)
- `Dashboard` — fetch aggregates using React Query (total earnings for month, upcoming lessons, attendance rate)
- `StudentsList` — paginated list, quick-add student modal
- `StudentProfile` — student header (rate, default length), recent lessons list, payments, attendance summary
- `LessonCalendar` — FullCalendar with events from `GET /api/lessons`
- `MarkAttendance` — modal or inline row: quick toggle present/absent, input actual minutes, save note

### Component patterns & state
- Data fetching pattern: use React Query hooks (`useQuery('lessons', ...)`) with caching and background refetch
- Use optimistic updates for quick UX (e.g., toggling attendance) with rollback on error
- Forms: React Hook Form + Zod schema; show server validation errors clearly
- UI tokens: central `theme.ts` with color tokens (primary, accent, bg, text, gold-accent)
- Accessibility: semantic HTML, labels, keyboard nav, focus state visible, aria attributes for modals

---

## Reporting & Business logic

### Salary calculation logic
- For each `Attendance` with status `PRESENT` or `MAKEUP`:
  - `earnings_cents = student.hourlyRateCents * (actualMin / 60)`
  - Round to nearest rupee/cent as per currency rules (use integers)
- Monthly report aggregates per student and totals across teacher's students
- Missing lessons (ABSENT) should show `0` earnings, but optionally included as missed session count

### Edge cases
- Lessons spanning a change in hourly rate: store historic rate on `Lesson` or on `Attendance` to calculate accurately
- Recurring lessons that were cancelled: store cancellation reason and whether charge applies
- Partial sessions: use `actualMin` and cap at scheduled duration if required

---

## Background jobs & scheduling

- Use BullMQ with Redis to handle:
  - Scheduled monthly report generation (first day of next month or on-demand)
  - Sending reminders (24h or 1h before lessons)
  - Periodic cleanup (remove temp files older than X days)

- Job best practices:
  - Store job metadata (who requested, params) in DB for audit
  - Idempotency keys for repeated jobs
  - Retry policy with exponential backoff

---

## Security & best practices

- Store secrets in environment variables (Vercel env / secrets manager). Never commit `.env`.
- Use prepared queries via Prisma — avoid raw string interpolation for SQL.
- Validate all inputs on server with Zod or similar.
- Rate limit critical endpoints (auth, attendance marking) to prevent abuse.
- Ensure CORS policy is strict and only allows your frontend origin.
- Serve files (PDF/exports) with signed temporary URLs.
- Enable HTTPS everywhere.

---

## Testing

- Unit tests: Jest + Vitest (for frontend and server logic)
- Integration tests: Playwright for critical flows (login, mark attendance, export report)
- API contract tests: supertest against route handlers
- E2E: GitHub Actions + Playwright test matrix (Chromium/Firefox)

---

## CI / CD

- Linting: eslint + prettier on push (prettier autoformat)
- Type checking: `tsc --noEmit`
- Tests: run unit + integration on PRs
- Deployment: automatic to Vercel from `main`; create preview deployments for PRs
- Migration strategy: use `prisma migrate` during CI or use `prisma migrate deploy` on release

---

## Observability & production readiness

- Use Sentry SDK in server & client to capture exceptions
- Track feature usage (e.g., number of lessons marked per day) using PostHog or Vercel Analytics
- Monitor DB slow queries via provider tools; add indexes on `lesson.scheduledAt`, `attendance.date`, `student.teacherId`

---

## Developer conventions

- Commit messages: Conventional Commits (feat/ fix/ chore/ docs/ refactor)
- Branching: feature branches off `main`, open PRs with description + linked issue
- Code reviews: require at least one approving review + passing CI before merge
- PR checklist: tests passing, types checked, no console logs, accessibility pass (basic)

---

## Roadmap & MVP milestones

1. **Week 0 — Planning**: finalize schema, wireframes, CI setup
2. **Week 1 — MVP (Core flows)**: auth, students CRUD, schedule lessons, mark attendance, monthly JSON report
3. **Week 2 — Exports + UI polish**: CSV & PDF export, dashboard widgets, mobile responsiveness
4. **Week 3 — Jobs & notifications**: reminders, background PDF generation
5. **Week 4 — Payments & invoicing**: add payments table + Stripe integration
6. **Week 5 — Testing & hardening**: E2E tests, Sentry, performance tuning

---

## Example dev commands

```bash
# install
pnpm install

# dev (Next.js)
pnpm dev

# generate prisma client after schema change
pnpm prisma generate
pnpm prisma migrate dev --name init

# run tests
pnpm test
```

---

## Design tokens (royal theme example)

- Primary: `#0b2447` (deep navy)
- Accent / Gold: `#C79A3A` (warm gold)
- Soft background: `#F7F6F2` (cream)
- Text primary: `#0B132B` (almost black)
- Accent 2: `#7DA3D7` (muted blue)

**Font pairing**: Playfair Display (headers) + Inter (body)

---

## Final checklist before launch

- [ ] End-to-end happy path for marking attendance and generating monthly PDF
- [ ] CSV export validated for accountant use
- [ ] Auth & session expiry working
- [ ] DB backups configured
- [ ] Error monitoring configured (Sentry)
- [ ] Mobile UX for quick marking

---

If you want, I can now:
- generate a starter `package.json` + `tsconfig.json` + minimal Next app skeleton, or
- create the Prisma `schema.prisma` file and `lib/prisma.ts` client file

Tell me which one I should drop into the repo next, King.

