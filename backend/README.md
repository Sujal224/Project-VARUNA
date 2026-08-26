# VARUNA Marine Intelligence Backend (Phase 1: Foundation)

This is the production backend service for the **VARUNA** Marine Intelligence platform, engineered to supply real-time oceanographic telemetry, PFZ calculations, safety alerts, explainable AI insights, and offline synchronization packages to the VARUNA mobile application.

---

## 1. Phase 1 Architecture Overview

Phase 1 establishes the clean, production-grade architectural foundation:

- **Express & TypeScript (Strict Mode):** Scalable, modular API server.
- **Zod Environment Validation (`src/config/env.ts`):** Runtime validation of `.env` configuration on startup.
- **Pino Structured Logger (`src/config/logger.ts`):** Low-overhead JSON logs in production, pretty-printed logs in development.
- **Security & Headers:** [Helmet](https://helmetjs.github.io/) headers + [CORS](https://expressjs.com/en/resources/middleware/cors.html) policy configuration.
- **Request Tracing:** Automatic UUID generation & `X-Request-Id` response headers.
- **Centralized Error Handling (`src/middleware/error.middleware.ts` & `src/common/errors/ApiError.ts`):** Deterministic operational errors and sanitized 500 error responses.
- **Standardized API Envelope (`src/common/responses/apiResponse.ts`):** Uniform `{ success, data, message, meta }` response structure.
- **Graceful Shutdown (`src/server.ts`):** Clean connection draining on `SIGINT` / `SIGTERM`.

---

## 2. Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts                     # Zod-validated environment schema
│   │   └── logger.ts                  # Pino logger instance
│   ├── middleware/
│   │   └── error.middleware.ts        # Centralized error handler & 404 catch-all
│   ├── common/
│   │   ├── errors/
│   │   │   └── ApiError.ts            # Standardized operational error class
│   │   └── responses/
│   │       └── apiResponse.ts         # Consistent API envelope generator
│   ├── routes/
│   │   └── index.ts                   # Master router mounting /api/v1
│   ├── app.ts                         # Express application factory
│   └── server.ts                      # Server bootstrap & lifecycle management
├── .env.example                       # Environment variables template
├── .gitignore                         # Git safety exclusions
├── package.json                       # Dependencies & build scripts
├── tsconfig.json                      # Strict TypeScript compiler options
└── README.md                          # Phase 1 documentation
```

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Installation
From the `backend` directory:
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development`, `test`, `production`) | `development` |
| `PORT` | HTTP port to listen on | `5000` |
| `CORS_ORIGIN` | Allowed CORS origins (`*` or comma-separated URLs) | `*` |

---

## 4. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the server with live TypeScript hot-reloading using `tsx watch` |
| `npm run typecheck` | Validates TypeScript types across all source files without emitting files (`tsc --noEmit`) |
| `npm run build` | Compiles TypeScript source to production-ready JavaScript in `/dist` (`tsc`) |
| `npm run start` | Runs the compiled production server from `/dist` (`node dist/server.js`) |

---

## 5. API Endpoints (Phase 1)

### `GET /api/v1/health`
Checks that the VARUNA backend process is alive and healthy.

#### Example Request:
```bash
curl -X GET http://localhost:5000/api/v1/health
```

#### Example Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "service": "VARUNA API",
    "status": "healthy"
  },
  "message": "VARUNA API is healthy.",
  "meta": {
    "version": "v1",
    "timestamp": "2026-08-26T17:15:00.000Z",
    "requestId": "e2c34a65-7489-4a41-bbf2-520e7e1f5731"
  }
}
```
