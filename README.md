# NextAuth + Keycloak Demo (Next.js 15)

This project demonstrates a clean integration of **Next.js 15** with **NextAuth.js** using **Keycloak** as an OIDC provider, following a secure BFF (Backend‑for‑Frontend) pattern.

- 🔐 Login with Keycloak via NextAuth
- 🍪 HTTP‑only cookie sessions (JWT strategy)
- 🚧 Middleware protection for `app` pages and `api` routes
- 🔁 Secure token refresh handled server‑side
- 🧰 BFF proxy routes to a Spring Boot backend (no tokens on the client)

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Getting started](#getting-started)
- [Keycloak setup (Docker)](#keycloak-setup-docker)
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

JWT tokens from Keycloak are stored server‑side (in the encrypted NextAuth JWT). BFF routes under `src/app/api/*` forward requests to the Spring Boot backend with the server‑only access token so the browser never sees bearer tokens.

---

## Tech stack

- **Next.js** 15 (App Router, Turbopack)
- **NextAuth.js** 4 (Keycloak provider, JWT sessions)
- **React** 19
- **TypeScript** 
- TailwindCSS 4 (optional, basic styles in the UI)

---

## Project structure

```text
src/
  app/
    app/
      page.tsx           # Protected dashboard page (server component)
    api/
      auth/
        [...nextauth]/route.ts   # NextAuth core routes (signin, callback, etc.)
        kc-logout/route.ts       # Revokes Keycloak session via refresh_token
        login/page.tsx           # Client relay to trigger signIn("keycloak")
        logout/route.ts          # (exists in tree) logout handler if needed
      me/route.ts                # GET → BFF proxy to backend /api/me
      update/route.ts            # POST → BFF proxy to backend /api/update
      admin/only/route.ts        # GET → BFF proxy to backend /api/admin/only
    dashboard/page.tsx           # Example page using BFF /api/me directly
    page.tsx                     # Public landing page
    layout.tsx                   # Root layout
  components/
    Providers.tsx                # NextAuth SessionProvider wrapper
  middleware.ts                  # Protects /app/* and /api/*
```

---

## Environment variables

Create `.env.local` and set:

```ini
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-random-secret>

AUTH_KEYCLOAK_ISSUER=http://localhost:8080/realms/demo
AUTH_KEYCLOAK_ID=next-app
AUTH_KEYCLOAK_SECRET=<client-secret-from-keycloak>

# Spring Boot backend URL used by BFF proxy routes
BACKEND_URL=http://localhost:8082
```

Generate a secure secret:

- macOS/Linux:
```bash
openssl rand -base64 32
```
- Windows PowerShell:
```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

---

## Getting started

```bash
git clone https://github.com/NatasaTM/nextauth-keycloak-demo.git
cd nextauth-keycloak-demo

npm install
# or
yarn install

cp .env.example .env.local  # if you have one, otherwise create .env.local and fill values

npm run dev
# open http://localhost:3000
```

---

## Keycloak setup (Docker)

Run Keycloak locally (dev mode):

```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:24.0.2 start-dev
```

In the Keycloak admin console:
- Create Realm → `demo`
- Create Client → `next-app`
  - Type: confidential
  - Standard flow: enabled
- Valid redirect URIs:
```text
http://localhost:3000/*
```
- Web origins:
```text
http://localhost:3000
```
- Copy the Client Secret into `AUTH_KEYCLOAK_SECRET`.

---

## Authentication flow

1) User requests a protected route (e.g., `/app`).
2) `middleware.ts` checks auth and redirects unauthenticated users to `/auth/login`.
3) `/auth/login` immediately calls `signIn("keycloak", { callbackUrl })`.
4) After Keycloak login, NextAuth receives tokens in `[...nextauth]/route.ts`.
5) `jwt` callback stores `access_token`, `refresh_token`, and `expires_at` in the NextAuth JWT.
6) On subsequent requests, the `jwt` callback refreshes the access token when it’s close to expiry.

---

## Middleware protection

See `src/middleware.ts`:
- Protects `"/app/:path*"` and `"/api/:path*"`.
- Always allows `"/api/auth/*"` (NextAuth internal endpoints).
- Unauthenticated users are redirected to `"/auth/login"`.

```ts
export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
```

---

## API routes (BFF)

These routes read the server‑side NextAuth JWT and forward requests to the Spring Boot backend using the Bearer token. The browser never sees the token.

- `GET /api/me` → forwards to `${BACKEND_URL}/api/me`
- `POST /api/update` → forwards JSON body to `${BACKEND_URL}/api/update`
- `GET /api/admin/only` → forwards to `${BACKEND_URL}/api/admin/only` (admin claims required)
- `POST /api/auth/kc-logout` → revokes Keycloak refresh token (call before `signOut()`)

Example header forwarding (from the code):
```ts
const r = await fetch(`${API_BASE}/api/me`, {
  headers: { Authorization: `Bearer ${access}` },
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

- Set all environment variables on your hosting provider (e.g., Vercel) and on your backend.
- For production, ensure `AUTH_KEYCLOAK_ISSUER` points to your public Keycloak realm URL.
- If deploying Keycloak yourself, consider: TLS, external database, and sticky session config if needed.
- Make sure `NEXTAUTH_URL` matches your public frontend domain.

---

## Useful links

- Next.js docs: https://nextjs.org/docs
- NextAuth.js docs: https://authjs.dev
- Keycloak docs: https://www.keycloak.org/documentation
- Example Spring Boot BFF: https://github.com/NatasaTM/springboot-keycloak-bff.git

---

## License

MIT — feel free to fork and adapt.
