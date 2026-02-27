# Qamar Web Application

**Qamar Web App** brings the Islamic companion experience to the web, providing accessible Islamic education and reflection for Muslims on any device.

---

## Overview

Qamar Web is a Next.js 15 application that provides the full Qamar reflection workflow experience on desktop and mobile browsers. Built with React 19, TypeScript, and Tailwind CSS, it offers the same reflection features as the mobile app with Stripe-based subscriptions and responsive design.

### Key Features

- **Islamic Reflection** — Daily reflections grounded in Quranic wisdom
- **Personalized Insights** — Reflections grounded in Quran and Hadith
- **Stripe Subscriptions** - Web-based billing with Plus and Pro tiers
- **Responsive Design** - Optimized for desktop, tablet, and mobile browsers
- **Session Authentication** - Secure cookie-based auth with magic link login
- **Islamic Framework** - Islamic framework for personal growth and reflection
- **Enterprise Security** - HTTPS-only, CSRF protection, rate limiting, encrypted data

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (client state) + React Query (server state)
- **Animations**: Framer Motion
- **Validation**: Zod
- **Testing**: Vitest, Playwright

### Backend Integration
- **API**: Node.js/Express backend (existing)
- **AI**: Anthropic Claude API
- **Payments**: Stripe Checkout & Customer Portal
- **Database**: PostgreSQL (via backend)
- **Session**: HTTP-only cookies

### Design System
- **Typography**: Cormorant Garamond (serif), Inter (sans-serif), Amiri (Arabic)
- **Colors**: Deep twilight (#0f1419), Gold (#D4AF37), Indigo (#1A237E)
- **Theme**: Dark-first with light mode support

---

## Getting Started

### Prerequisites

```bash
Node.js 20+
npm or pnpm
Git
```

### Installation

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the `web/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Stripe (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database (optional - backend handles this)
DATABASE_URL=postgresql://user:password@host:port/database
```

**Production values:**
- `NEXT_PUBLIC_API_URL`: `https://api.noor.app`
- Use Stripe live keys (`pk_live_...`, `sk_live_...`)

---

## Project Structure

```
web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, signup)
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected routes
│   │   ├── reflect/              # Reflection workflow
│   │   ├── history/              # Past reflections
│   │   ├── insights/             # AI-generated insights
│   │   ├── account/              # Settings & billing
│   │   └── layout.tsx            # Dashboard layout
│   ├── api/                      # API routes (Stripe webhooks)
│   │   └── stripe/
│   │       └── webhook/
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   └── test/                     # Test pages (dev only)
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── GlassCard.tsx
│   │   └── Input.tsx
│   ├── reflection/               # Reflection workflow components
│   │   ├── ThoughtCapture.tsx
│   │   ├── DistortionDisplay.tsx
│   │   ├── ReframeDisplay.tsx
│   │   └── IntentionSetting.tsx
│   ├── layout/                   # Layout components
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   └── marketing/                # Landing page components
├── lib/
│   ├── api.ts                    # Backend API client
│   ├── query-client.ts           # React Query setup
│   ├── theme.ts                  # Theme constants
│   ├── stripe.ts                 # Stripe helpers
│   └── auth.ts                   # Auth utilities
├── hooks/                        # React Query hooks
│   ├── useReflection.ts
│   ├── useAuth.ts
│   └── useSubscription.ts
├── styles/
│   └── globals.css               # Tailwind + custom CSS
├── public/                       # Static assets
│   ├── fonts/
│   └── images/
├── middleware.ts                 # Route protection
├── tailwind.config.ts            # Tailwind configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## Available Scripts

### Development

```bash
# Start development server (http://localhost:3000)
npm run dev

# Type checking (TypeScript compiler)
npm run typecheck
# or
npx tsc --noEmit

# Linting (ESLint)
npm run lint

# Format code (Prettier - if configured)
npm run format
```

### Testing

```bash
# Run unit tests (Vitest)
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Test coverage report
npm run test:coverage
```

### Production

```bash
# Build for production
npm run build

# Start production server (after build)
npm run start

# Build and analyze bundle size
npm run analyze
```

---

## Development Workflow

### 1. Start Backend Server

The web app requires the backend server to be running:

```bash
# In the root directory
cd server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Start Web App

```bash
# In the web directory
cd web
npm run dev
```

Web app will run on `http://localhost:3000`

### 3. Test API Connectivity

Visit `http://localhost:3000/test` to verify backend connection.

You should see a health check response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

If you see CORS errors, ensure `WEB_APP_URL=http://localhost:3000` is set in `server/.env`

---

## Testing

### Unit Tests

Component and utility function tests using Vitest + React Testing Library:

```bash
npm run test
```

**Example test:**
```typescript
// components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### E2E Tests

Full workflow tests using Playwright:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test reflection-flow.spec.ts

# Open Playwright UI for debugging
npm run test:e2e:ui
```

**Example E2E test:**
```typescript
// tests/e2e/reflection-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete reflection workflow', async ({ page }) => {
  await page.goto('http://localhost:3000/reflect')

  // Enter thought
  await page.fill('textarea', 'I am going to fail this exam')
  await page.click('button:has-text("Analyze")')

  // Wait for AI response
  await page.waitForSelector('.distortion-card')

  // Verify distortion detected
  await expect(page.locator('.distortion-card')).toContainText('Catastrophizing')
})
```

### Type Checking

```bash
# Run TypeScript compiler in check mode
npm run typecheck

# Watch mode for continuous type checking
npx tsc --noEmit --watch
```

---

## Deployment

### Vercel (Recommended)

Vercel is optimized for Next.js applications.

#### Initial Setup

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd web
vercel
```

Follow the prompts to link your project.

#### Environment Variables

Set in Vercel dashboard (Settings > Environment Variables):

```bash
NEXT_PUBLIC_API_URL=https://api.noor.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Production Deployment

```bash
# Deploy to production
vercel --prod
```

#### Auto-Deploy from GitHub

1. Import repository in Vercel dashboard
2. Connect GitHub repository
3. Auto-deploy on push to `main` branch

### Custom Server

If deploying to a custom server:

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

**Server requirements:**
- Node.js 20+
- Port 3000 available (or set `PORT` env var)
- Environment variables configured

### Docker (Optional)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build Docker image
docker build -t noor-web .

# Run container
docker run -p 3000:3000 --env-file .env.local noor-web
```

---

## Configuration

### Tailwind CSS

Custom theme configuration in `tailwind.config.ts`:

```typescript
// Qamar brand colors
colors: {
  background: '#0f1419',        // Deep twilight
  'background-card': '#242f42', // Card surface
  moonlight: '#e8f0f8',         // Primary text
  gold: '#D4AF37',              // Brand gold
  'gold-light': '#f0d473',      // Accent gold
  emerald: '#009688',           // Islamic green
  indigo: '#1A237E',            // Contemplation blue
}

// Typography
fontFamily: {
  serif: ['var(--font-serif)'],     // Cormorant Garamond
  sans: ['var(--font-sans)'],       // Inter
  arabic: ['var(--font-arabic)'],   // Amiri
}
```

### TypeScript

Strict mode enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

### ESLint

Next.js recommended config in `eslint.config.mjs`:

```javascript
import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
]
```

---

## API Integration

All backend API calls use the centralized `lib/api.ts` client with session cookies:

```typescript
// Example: Analyze thought
import { analyzeThought } from '@/lib/api'

const response = await analyzeThought({
  thought: 'I am going to fail this exam',
  emotionalIntensity: 7
})
```

See [API Integration Guide](docs/API_INTEGRATION.md) for complete documentation.

---

## Authentication

Session-based authentication with HTTP-only cookies:

- **Login**: Magic link sent to email
- **Session**: 30-day expiration
- **Protected Routes**: Middleware checks session cookie
- **Logout**: Clears session cookie

```typescript
// Example: Check auth status
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>

  return <div>Welcome, {user.email}</div>
}
```

---

## Subscription Tiers

Managed via Stripe:

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Core features, 3 sessions/day for tutor and pronunciation |
| **Plus** | $2.99/month | Unlimited conversations, full Quran audio, all learning features |
| **Plus** | $19.99/year | Same as monthly (save 44%) |
| **Lifetime** | $49.99 | All Plus features forever |

Upgrade flow:
1. User clicks "Upgrade" on `/pricing`
2. Redirect to Stripe Checkout
3. Webhook updates subscription status
4. Features unlock immediately

---

## Troubleshooting

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` error in browser console

**Solution**: Ensure backend has web app URL in allowed origins:

```typescript
// server/index.ts
const allowedOrigins = [
  process.env.WEB_APP_URL, // http://localhost:3000
  // ... other origins
]
```

### Session Cookie Not Set

**Problem**: API calls return 401 Unauthorized

**Solution**: Ensure `credentials: 'include'` in all fetch calls:

```typescript
fetch(`${API_URL}/api/endpoint`, {
  credentials: 'include', // Required for cookies
  // ...
})
```

### Fonts Not Loading

**Problem**: Cormorant Garamond not visible

**Solution**: Check `app/layout.tsx` imports Google Fonts:

```typescript
import { Cormorant_Garamond } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-serif'
})
```

### Build Errors

**Problem**: TypeScript errors during build

**Solution**: Run type checking to find issues:

```bash
npx tsc --noEmit
```

Fix all errors before building.

### Stripe Webhook Not Working

**Problem**: Subscription status not updating after payment

**Solution**: Verify webhook endpoint and secret:

1. Check Stripe dashboard webhook is pointing to `https://yourdomain.com/api/stripe/webhook`
2. Verify `STRIPE_WEBHOOK_SECRET` in `.env.local` matches dashboard
3. Check webhook logs in Stripe dashboard

---

## Performance Optimization

### Bundle Size

- Code splitting enabled by default (Next.js)
- Lazy load heavy components with `dynamic()`
- Target: < 200KB gzipped

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority // For above-the-fold images
/>
```

### Caching

React Query handles server state caching:

```typescript
const { data } = useQuery({
  queryKey: ['reflections'],
  queryFn: fetchReflections,
  staleTime: 60 * 1000, // 1 minute
})
```

---

## Security

- **HTTPS Only**: Force SSL in production
- **CSRF Protection**: CSRF tokens on all state-changing endpoints
- **Rate Limiting**: 100 requests/15min per IP
- **Input Validation**: Zod schemas on all user inputs
- **XSS Prevention**: React escapes by default
- **SQL Injection**: Drizzle ORM parameterizes queries
- **Secrets**: Never commit `.env.local` to git

See [Security Policy](../SECURITY.md) for comprehensive details.

---

## Accessibility

- **WCAG 2.1 AA** compliance target
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: ARIA labels on icon-only buttons
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Semantic HTML**: Proper heading hierarchy, landmarks

Test with:
```bash
# Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

---

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari iOS 14+
- Chrome Android (last 2 versions)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, testing requirements, and PR process.

---

## Documentation

- [API Integration Guide](docs/API_INTEGRATION.md) - Backend endpoints and authentication
- [Contributing Guide](CONTRIBUTING.md) - Code standards and workflow
- [Root README](../README.md) - Full project overview
- [Security Policy](../SECURITY.md) - Security implementation details
- [Privacy Policy](../PRIVACY_POLICY.md) - Data handling and privacy

---

## License

[MIT License](../LICENSE)

---

## Support

- **Technical Support**: scale@getbyteworthy.com
- **Security Issues**: security@getbyteworthy.com
- **Privacy Questions**: privacy@getbyteworthy.com

---

**Bismillah!** May this web app bring clarity and peace to those who use it.

_"Allah does not burden a soul beyond that it can bear."_ - Quran 2:286
