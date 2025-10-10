# Next.js + NextAuth + Keycloak (BFF Pattern)

> 📚 **Full tutorial:** Read the step-by-step guide here →  
> https://natasatm.netlify.app/articles/nextjs-keycloak-spring-boot-bff

This project demonstrates a clean integration of **Next.js 15** with **NextAuth.js** using **Keycloak** as an OIDC provider, following a secure BFF (Backend-for-Frontend) pattern.

- 🔐 Login with Keycloak via NextAuth
- 🍪 HTTP-only cookie sessions (JWT strategy)
- 🚧 Middleware protection for `app` pages and `api` routes
- 🔁 Secure token refresh handled server-side
- 🧰 BFF proxy routes to a Spring Boot backend (no tokens on the client)
- 🐳 Complete Docker setup with Keycloak + Mailpit
- 🎨 Custom Keycloak login theme included
- 🤝 Pairs with the [Spring Boot backend](https://github.com/NatasaTM/springboot-keycloak-bff)

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Docker setup (Keycloak + Mailpit)](#docker-setup-keycloak--mailpit)
- [Environment variables](#environment-variables)
- [Keycloak configuration](#keycloak-configuration)
- [Custom Keycloak theme](#custom-keycloak-theme)
- [Authentication flow](#authentication-flow)
- [Middleware protection](#middleware-protection)
- [API routes (BFF)](#api-routes-bff)
- [Scripts](#scripts)
- [Deployment notes](#deployment-notes)
- [Useful links](#useful-links)
- [License](#license)

---

## Overview

The app uses NextAuth with the Keycloak provider. Users hitting protected routes are redirected to a minimal relay page at `/auth/login` that immediately calls `signIn("keycloak")` and then returns them to the original page via `callbackUrl`.

JWT tokens from Keycloak are stored server-side (in the encrypted NextAuth JWT). BFF routes under `src/app/api/*` forward requests to the Spring Boot backend with the server-only access token so the browser never sees bearer tokens.

---

## Tech stack

- **Next.js** 15 (App Router, Turbopack)
- **NextAuth.js** 5 (Keycloak provider, JWT sessions)
- **React** 19
- **TypeScript**
- **Tailwind CSS** 4
- **Keycloak** 24.x (via Docker)
- **Mailpit** (local email testing)

---

## Project structure

```text
web-next/
  src/
    app/
      app/
        page.tsx           # Protected dashboard page
      api/
        auth/
          [...nextauth]/route.ts   # NextAuth core routes
          kc-logout/route.ts       # Revokes Keycloak session
          login/page.tsx           # Client relay to trigger signIn
        me/route.ts                # BFF proxy to backend /api/me
        update/route.ts            # BFF proxy to backend /api/update
        admin/only/route.ts        # BFF proxy to backend /api/admin/only
      page.tsx                     # Public landing page
      layout.tsx                   # Root layout
    components/
      Providers.tsx                # NextAuth SessionProvider wrapper
    middleware.ts                  # Protects /app/* and /api/*
  docker/
    docker-compose.yml             # Keycloak + Mailpit setup
  themes/
    my-theme/
      login/                       # Custom Keycloak theme
```

---

## Getting started

### Prerequisites

- Node.js 18+
- Docker Desktop
- Java 21 and Maven (for the Spring Boot backend)

### 1. Clone the repository

```bash
git clone https://github.com/NatasaTM/nextauth-keycloak-demo.git
cd nextauth-keycloak-demo/web-next
```

### 2. Start Keycloak and Mailpit

```bash
cd docker
docker compose up -d
```

This starts:
- **Keycloak** on http://localhost:8080 (admin: `admin` / `admin`)
- **Mailpit** on http://localhost:8025 (email testing UI)

### 3. Set up environment variables

Create a `.env.local` file in the `web-next` directory:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-a-random-32-byte-string>
AUTH_KEYCLOAK_ISSUER=http://localhost:8080/realms/demo
AUTH_KEYCLOAK_ID=next-app
AUTH_KEYCLOAK_SECRET=<your-client-secret-from-keycloak>
BACKEND_URL=http://localhost:8082
```

Generate a secure secret:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

### 4. Configure Keycloak

Follow the [full tutorial](https://natasatm.netlify.app/articles/nextjs-keycloak-spring-boot-bff) or see the [Keycloak configuration](#keycloak-configuration) section below.

### 5. Install dependencies and run

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### 6. Start the Spring Boot backend

In a separate terminal, clone and run the [Spring Boot backend](https://github.com/NatasaTM/springboot-keycloak-bff):

```bash
git clone https://github.com/NatasaTM/springboot-keycloak-bff.git
cd springboot-keycloak-bff

export KC_ISSUER_URI=http://localhost:8080/realms/demo
export ALLOWED_ORIGINS=http://localhost:3000

mvn spring-boot:run
```

The backend will be available at http://localhost:8082.

---

## Docker setup (Keycloak + Mailpit)

This project includes a complete Docker Compose setup in the `docker/` folder that runs both Keycloak and Mailpit.

### What's included

- **Keycloak 24.0.2** with:
  - Admin console on port 8080
  - Persistent data volume (`kc_data`)
  - Custom theme auto-mounted from `themes/` folder
  - Cache disabled for theme development
- **Mailpit** for local email testing:
  - SMTP server on port 1025
  - Web UI on port 8025

### Start the containers

```bash
cd docker
docker compose up -d
```

### Stop the containers

```bash
docker compose down
```

### Reset everything (including persisted data)

```bash
docker compose down -v
```

This removes the `kc_data` volume, so you'll need to reconfigure Keycloak.

### Check logs

```bash
docker compose logs -f keycloak
docker compose logs -f mailpit
```

### Access the services

- **Keycloak admin console:** http://localhost:8080 (login: `admin` / `admin`)
- **Mailpit web UI:** http://localhost:8025

---

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Your application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Random secret for session encryption | Generate with `openssl rand -base64 32` |
| `AUTH_KEYCLOAK_ISSUER` | Keycloak realm issuer URL | `http://localhost:8080/realms/demo` |
| `AUTH_KEYCLOAK_ID` | Keycloak client ID | `next-app` |
| `AUTH_KEYCLOAK_SECRET` | Keycloak client secret | From Keycloak Clients → Credentials |
| `BACKEND_URL` | Spring Boot backend URL | `http://localhost:8082` |

---

## Keycloak configuration

### 1. Create a realm

1. Open the Keycloak admin console at http://localhost:8080
2. Click the dropdown next to "master" → **Create realm**
3. Name: `demo`

### 2. Create roles

1. Go to **Realm roles** → **Create role**
2. Create two roles: `USER` and `ADMIN`

### 3. Set USER as the default role

1. **Realm roles** → **Default roles**
2. Click **Add roles**
3. Select `USER` and add it

### 4. Enable registration and email verification

1. Go to **Realm settings** → **Login** tab
2. Enable:
   - ✅ User registration
   - ✅ Forgot password
   - ✅ Verify email
3. Save changes

### 5. Configure Mailpit for emails

1. **Realm settings** → **Email** tab
2. Fill in:

| Field | Value |
|-------|-------|
| From | admin@demo.local |
| From display name | Keycloak Demo |
| Host | mailpit |
| Port | 1025 |
| Enable SSL | ❌ |
| Enable StartTLS | ❌ |
| Authentication | Disabled |

3. Click **Test connection** and check Mailpit UI at http://localhost:8025

### 6. Create a client

1. Go to **Clients** → **Create client**
2. Settings:
   - **Client ID:** `next-app`
   - **Client type:** OpenID Connect
   - **Client authentication:** ON
3. **Capability config:**
   - **Standard flow:** ON
   - **Direct access grants:** OFF
4. **Login settings:**
   - **Valid redirect URIs:** `http://localhost:3000/*`
   - **Valid post logout redirect URIs:** `http://localhost:3000/*`
   - **Web origins:** `http://localhost:3000`
5. **Advanced settings:**
   - **Proof Key for Code Exchange (PKCE):** S256 Required
6. Save
7. Go to **Credentials** tab and copy the **Client secret**

---

## Custom Keycloak theme

This project includes a custom Keycloak login theme in the `themes/my-theme/` folder.

### Features

- Custom colors and branding
- "Back to site" link on login page
- Responsive design
- Email verification and password reset pages

### Apply the theme

1. Make sure Docker Compose is running (theme is auto-mounted)
2. In Keycloak admin panel:
   - Go to **Realm settings** → **Themes**
   - Under **Login theme**, select `my-theme`
   - Click **Save**
3. Refresh the login page

### Customize the theme

The theme files are in `themes/my-theme/login/`:

- **`theme.properties`** - Theme metadata and configuration
- **`resources/css/login.css`** - Custom styles
- **`resources/img/logo.png`** - Your logo
- **`*.ftl` files** - Freemarker templates (HTML structure)

Since caching is disabled in Docker Compose, changes apply immediately after page refresh.

---

## Authentication flow

1. User requests a protected route (e.g., `/app`)
2. `middleware.ts` checks auth and redirects unauthenticated users to `/auth/login`
3. `/auth/login` immediately calls `signIn("keycloak", { callbackUrl })`
4. After Keycloak login, NextAuth receives tokens in `[...nextauth]/route.ts`
5. `jwt` callback stores `access_token`, `refresh_token`, and `expires_at` in the NextAuth JWT
6. On subsequent requests, the `jwt` callback refreshes the access token when it's close to expiry

---

## Middleware protection

See `src/middleware.ts`:
- Protects `"/app/:path*"` and `"/api/:path*"`
- Always allows `"/api/auth/*"` (NextAuth internal endpoints)
- Unauthenticated users are redirected to `"/auth/login"`

```typescript
export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
```

---

## API routes (BFF)

These routes read the server-side NextAuth JWT and forward requests to the Spring Boot backend using the Bearer token. The browser never sees the token.

### Available endpoints

- **`GET /api/me`** → forwards to `${BACKEND_URL}/api/me`
- **`POST /api/update`** → forwards JSON body to `${BACKEND_URL}/api/update`
- **`GET /api/admin/only`** → forwards to `${BACKEND_URL}/api/admin/only` (requires ADMIN role)
- **`POST /api/auth/kc-logout`** → revokes Keycloak refresh token (call before `signOut()`)

### Example implementation

```typescript
const token = await getToken({ req });
const response = await fetch(`${process.env.BACKEND_URL}/api/me`, {
  headers: { 
    Authorization: `Bearer ${token.access_token}` 
  },
  cache: "no-store",
});
```

---

## Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint"
}
```

---

## Deployment notes

### Local development

1. Run Docker Compose for Keycloak and Mailpit
2. Configure environment variables in `.env.local`
3. Run `npm run dev`
4. Start the Spring Boot backend

### Production deployment

When deploying to production:

- **Use HTTPS** for both frontend and Keycloak
- **Update `NEXTAUTH_URL`** to your production domain
- **Update `AUTH_KEYCLOAK_ISSUER`** to your production Keycloak URL
- **Configure proper SMTP** instead of Mailpit (e.g., SendGrid, AWS SES)
- **Use a production-ready Keycloak setup** with external database
- **Set secure environment variables** in your hosting platform
- **Update Keycloak client redirect URIs** to match production URLs

### Example deployment on Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Update Keycloak client settings with Vercel URLs

---

## Useful links

- **Full tutorial:** https://natasatm.netlify.app/articles/nextjs-keycloak-spring-boot-bff
- **Backend companion (Spring Boot):** https://github.com/NatasaTM/springboot-keycloak-bff
- [Next.js documentation](https://nextjs.org/docs)
- [NextAuth.js (Auth.js) documentation](https://authjs.dev)
- [Keycloak documentation](https://www.keycloak.org/documentation)
- [Mailpit documentation](https://github.com/axllent/mailpit)

---

## License

MIT © 2025 Natasa Todorov Markovic  
Feel free to fork and adapt.