# SkyBook Installation & Setup Guide

## Prerequisites
- Node.js: `v20.x` or `v22.x` (tested on Node v22.23.1)
- npm: `v10.x` or `v12.x`

## Installation

```bash
git clone <repo-url> sky-booking
cd sky-booking
npm install
```

## Running the Application

### Option A: Concurrent Startup (Recommended)
Starts both JSON Server (port 3000) and Angular Development Server (port 4200):

```bash
npm start
```

### Option B: Separate Terminals

**Terminal 1 (REST API - JSON Server):**
```bash
npm run api
```
Accessible at: `http://localhost:3000`

**Terminal 2 (Frontend Client - Angular):**
```bash
npm run client
```
Accessible at: `http://localhost:4200`

## Demo Accounts
- **Admin:** `admin@skybook.com` / `admin123` (Access to `/admin` management console)
- **Customer:** `demo@skybook.com` / `demo123`
