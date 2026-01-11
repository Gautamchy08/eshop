# E-Shop Monorepo - AI Agent Instructions

## Architecture Overview

This is an **Nx monorepo** for a multi-tenant e-commerce platform with separate user and seller interfaces, microservices backend, and shared component libraries.

### Key Applications

- **`apps/user-ui/`** - Next.js 15 customer-facing storefront
- **`apps/seller-ui/`** - Next.js 15 seller dashboard for product/shop management
- **`apps/auth-service/`** - Express.js authentication microservice (port 6001)
- **`apps/api-gateway/`** - Express.js API gateway with rate limiting and proxying
- **`packages/`** - Shared libraries (components, middleware, error handlers)

### Data Layer

- **MongoDB** via Prisma ORM (models in `prisma/schema.prisma`)
- **Redis** (Upstash) for caching and sessions
- **Prisma Client** generated to `node_modules/.prisma/client` (not `generated/`)
- Key models: `users`, `sellers`, `shops`, `products`, `orders`, `images`

## Critical Workflows

### Running Applications

```bash
# ALWAYS use npx nx commands (nx is not globally installed)
npx nx serve auth-service        # Start auth service
npx nx serve user-ui            # Start user UI
npx nx serve seller-ui          # Start seller UI
npm run dev                      # Start all apps concurrently

# View available tasks for a project
npx nx show project <app-name>
```

### Database Operations

```bash
# Prisma commands run from workspace root
npx prisma generate             # Regenerate client after schema changes
npx prisma db push              # Push schema changes to MongoDB
npx prisma studio               # Visual database browser
```

### Code Generation

```bash
# Generate new Next.js app
npx nx g @nx/next:app apps/<app-name>

# Generate Express microservice
npx nx g @nx/express:app apps/<service-name>
```

## Project-Specific Conventions

### Import Paths

- **Packages**: Use `@packages/*` alias for shared code (configured in `tsconfig.base.json`)
  ```typescript
  import { errorMiddleware } from '@packages/error-handler/error-middleware';
  import isAuthenticated from '@packages/middleware/isAuthenticated';
  ```
- **Components**: Seller/user UI share components from `packages/components/`
- **NO relative imports** across packages - always use path aliases

### Component Patterns

#### Input Component (packages/components/input/)

- **Default export**, use `import Input from '@packages/components/input'` (NOT `{ Input }`)
- Supports both input and textarea via `type` prop
- Uses `forwardRef` for react-hook-form compatibility
- Tailwind classes: dark theme (`bg-transparent`, `text-white`, `border-gray-600`)

#### Image Upload (apps/seller-ui/src/shared/components/image-placeholder/)

- Uses Next.js `<Image>` component with `width={400} height={400}`
- State management: `imagePreview` controls conditional rendering
- **Critical**: Image must be inside `{imagePreview ? ... }` block to display after upload
- File handling via `URL.createObjectURL()` for local preview

### Authentication Flow

1. **Registration** → OTP sent via email (nodemailer)
2. **Verification** → OTP validated, JWT tokens issued
3. **JWT Strategy**:
   - Access token in `access_token` / `seller-access-token` cookies
   - Refresh token for renewal
   - Middleware: `isAuthenticated` checks cookies OR `Authorization` header

### API Structure

- **Auth routes**: All in `apps/auth-service/src/routes/auth.router.ts`
  - User: `/api/user-registration`, `/api/login-user`, `/api/logged-in-user`
  - Seller: `/api/seller-registration`, `/api/login-seller`, `/api/create-shop`
- **Gateway**: Proxies requests to microservices with rate limiting (100 req/15min guests, 1000 for auth users)
- **Swagger docs**: Generated with `swagger-autogen`, available at `http://localhost:6001/api-docs`

### Error Handling

- **Centralized**: `packages/error-handler/error-middleware.ts`
- Use `AppError` class for business logic errors:
  ```typescript
  throw new AppError(400, 'Validation failed', { field: 'email' });
  ```
- Middleware MUST be registered **after all routes** in Express apps

### Styling Conventions

- **Tailwind CSS** exclusively (no CSS modules)
- Dark theme default for seller-ui: `bg-[#1e1e1e]`, `text-white`, `border-gray-600`
- Responsive patterns: `md:w-[50%]`, `md:flex-row`
- Form layouts: Use flexbox (`flex flex-col`) for vertical stacking, `justify-between` for horizontal spacing

### Multi-Step Forms (Signup Pattern)

- Stepper UI: Circles with connecting line (see `apps/seller-ui/src/app/(routes)/signup/page.tsx`)
- Structure:
  ```tsx
  <div className="relative w-full md:w-[50%] mb-12 h-10 flex items-center justify-center">
    <div className="absolute top-1/2 left-12 right-12 h-1 bg-gray-300" />
    <div className="flex justify-between w-full px-4 relative z-10">{/* Step circles here */}</div>
  </div>
  ```
- **Critical**: Line must be absolutely positioned OUTSIDE flex container, circles need `z-10` to overlay

### State Management

- **react-hook-form** for forms (`useForm`, `register`, `handleSubmit`)
- **TanStack Query** for API calls (`useMutation`, not `useQuery` for mutations)
- **Jotai** for global state (atoms)
- **Local state** with `useState` for UI toggles (OTP visibility, password show/hide)

## Common Pitfalls

1. **nx commands**: Never run `nx` directly - use `npx nx` (not installed globally)
2. **Import errors**: Default exports don't use `{}` - check component export type
3. **Image not showing**: Ensure `<Image>` is inside `{imagePreview ? ... }` conditional
4. **z-index issues**: Absolute positioned elements need explicit stacking context
5. **Prisma client**: After schema changes, run `npx prisma generate` before code changes
6. **Environment variables**: Use `process.env.NEXT_PUBLIC_*` for client-side in Next.js

## Testing & Debugging

- Jest configured via Nx plugin (`@nx/jest/plugin`)
- E2E apps: `auth-service-e2e`, `api-gateway-e2e` (excluded from test plugin)
- **No active test suite** - focus on manual testing via Swagger/browser

## External Integrations

- **Stripe Connect**: Seller onboarding flow (`/create-stripe-link` endpoint)
- **Email**: Gmail SMTP via nodemailer (credentials in `.env`)
- **Rate Limiting**: express-rate-limit with IP-based keys
- **CORS**: Configured for `http://localhost:3000` origin

---

_Last updated: Jan 2026 | For Nx-specific questions, use the nx_docs MCP tool_
