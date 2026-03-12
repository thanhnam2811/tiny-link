# 🚀 TinyLink - Production-Grade URL Shortener

A streamlined URL shortening service focused on high performance, reliability, and observability, specifically designed for Free-tier environments.

## 🌟 Key Features

- **Fast Redirect:** Blazing-fast redirection using 302/307 status codes to optimize analytics tracking.
- **Reliable Tracking:** Click logging system utilizing a **Memory Queue + Batch Insert** mechanism to reduce database overhead.
- **Configurable SEO:** Supports customizable redirect types (301/302).
- **Security:** Integrated Rate Limiting to prevent spam and brute-force attacks.
- **Analytics API:** Detailed click insights including IP, User-Agent, and Referrer.

## 🛠 Tech Stack

- **Backend:** Node.js + TypeScript + Fastify (High performance).
- **Database:** PostgreSQL (Neon / Supabase - Serverless Postgres).
- **Caching & Rate Limit:** Memory-based (or Redis for scaling).
- **DevOps:** Docker, GitHub Actions, Fly.io / Render.
- **Logging:** Pino (Structured JSON logs).

## 🏗 System Architecture

1. **Client** sends a request to `/:code`.
2. **Fastify** checks Cache/DB to retrieve the Long URL.
3. Sends a Redirect response to the Client immediately.
4. Pushes the Click event into an **Internal Queue**.
5. **Background Worker** performs a Batch Insert into Postgres every 1-5 seconds.

## 🚀 Quick Start

1. Clone the repo: `git clone ...`
2. Install dependencies: `npm install`
3. Setup `.env`: Copy from `.env.example`
4. Run with Docker: `docker-compose up -d`
