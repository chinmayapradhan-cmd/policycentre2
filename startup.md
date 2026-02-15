# PolicyCenter Replica - Startup Guide

This guide provides step-by-step instructions to set up and run the PolicyCenter Replica application.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
- **Git**: To clone the repository (if not already done).

## 1. Project Setup

Open your terminal and navigate to the project root directory.

### Install Dependencies

Run the following command to install all necessary dependencies for both the API and Web applications:

```bash
npm install
```

## 2. Environment Configuration

### Web Application (`apps/web`)

Create a `.env.local` file in `apps/web` if it doesn't exist.

**Path:** `apps/web/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### API Application (`apps/api`)

Create a `.env` file in `apps/api` if it doesn't exist.

**Path:** `apps/api/.env`

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## 3. Database Setup

The application uses an SQLite database. You need to seed it with initial data before running the app.

Run the seeding script from the project root:

```bash
npm run seed
```

This will:
- Initialize the SQLite database at `apps/api/database.sqlite`.
- Populate it with data from `db/seed-data.json`.

## 4. Running the Application

To start both the Backend API and Frontend Web application concurrently, run:

```bash
npm run dev
```

> **Note**: Keep this terminal window open to keep the server running.


- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Automation UI**: See `ui/startup.md` (Runs on separate port, e.g., 3001/3002)

## 5. Usage

1. Open http://localhost:3000 in your browser.
2. Login with any username/password (e.g., `admin`).
3. Navigate to **Monitoring -> Message Queues** to view the implementation.

## Troubleshooting

- **Port Conflicts**: If port 3000 or 4000 is in use, update the `.env` files and `apps/api/.env` accordingly.
- **Database Errors**: If you encounter database issues, delete `apps/api/database.sqlite` and re-run `npm run seed`.
