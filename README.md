# Roam Admin Dashboard

Built with Vue 3, Vite, Tailwind CSS, and deployed on Cloudflare Pages with D1 database integration.

## 🚀 Features

- **DNS Record Management**: View and manage DNS records for different clients
- **Real-time DNS Verification**: Verify DNS records against Cloudflare DNS
- **Cloudflare Integration**: Built on Cloudflare Pages with D1 database
- **Token-based Access**: Secure client access using encrypted tokens

## 🏗️ Architecture

### Frontend
- **Vue 3** with Composition API
- **Vite** for fast development and building
- **Vue Router** for client-side routing
- **Pinia** for state management
- **Tailwind CSS** for styling
- **DaisyUI** for UI components

### Backend (Cloudflare Workers)
- **Cloudflare Pages Functions** for API endpoints
- **D1 Database** for data persistence
- **Token-based authentication** for secure access

### Key Components
- `HomePage.vue`: Main dashboard for viewing DNS records
- `AdminPage.vue`: Admin authentication and management panel
- `DnsTable.vue`: Displays DNS records with verification status
- `AdminPanel.vue`: Admin interface for managing records

## 📁 Project Structure

```
roam-admin/
├── functions/api/          # Cloudflare Workers API functions
│   ├── admin.js           # Admin authentication
│   ├── dns.js             # DNS record management
│   ├── authentication.js  # Auth utilities
│   └── token.js           # Token encryption/decryption
├── src/
│   ├── components/        # Vue components
│   ├── config/           # API configuration
│   ├── router/           # Vue Router setup
│   ├── stores/           # Pinia stores
│   └── styles/           # Global styles
├── wrangler.toml         # Cloudflare configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account with D1 database
- Wrangler CLI (`npm install -g wrangler`)

## 🚀 Getting Started

### 1. Install Dependencies

```sh
pnpm install
```

### 2. Environment Setup

Create a `.dev.vars` file in the root directory for local development:

```env
DNS_SECRET_KEY=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 3. Database Setup

Ensure your D1 database has the required tables:

```sh
pnpm wrangler d1 execute roam_sass --command="CREATE TABLE "dns_records" ("id" integer PRIMAR
Y KEY,"client" text,"type" text,"host" text,"data" text)" --local

pnpm wrangler d1 execute roam_sass --command="CREATE TABLE "authentication"(
    "id" INTEGER,
    "hostname" TEXT,
    "uri" TEXT,
    "username" TEXT,
    "password" TEXT,
    "enabled" INTEGER NOT NULL, "theme" TEXT NOT NULL DEFAULT "roam",
    PRIMARY KEY ("id")
    )" --local
```

### 4. Development

#### Option A: Full Stack Development (Recommended)
Run both the Vue dev server and Cloudflare Workers locally:

```sh
pnpm dev:full
```

This starts:
- Vue dev server on `http://localhost:5173`
- Cloudflare Functions on `http://localhost:8788`

## 🔧 Available Scripts

- `pnpm dev:full` - Start both frontend and backend in development
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier

## 🔍 API Endpoints

### DNS Records
- `GET /api/dns?token=<token>` - Get DNS records for a client
- `POST /api/dns` - Create new DNS record

### Authentication
- `POST /api/admin` - Admin authentication

## 🐛 Debugging

### View Deployment Logs
```sh
npx wrangler pages deployment tail
```

### Local Development Logs
When running `pnpm dev:full`, logs appear in both terminal windows.

## 📝 Environment Variables

### Required for Production
- `DNS_SECRET_KEY` - Secret key for token encryption/decryption
- `ADMIN_USERNAME` - Admin panel username
- `ADMIN_PASSWORD` - Admin panel password