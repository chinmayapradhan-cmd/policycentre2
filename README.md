# PolicyCenter Replica

A full-stack web application replicating Guidewire PolicyCenter's "Message Queues" monitoring screen.

## Technologies
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite3
- **Monorepo**: npm workspaces

## Prerequisites
- Node.js (v18+)
- npm

## Installation

1.  Clone the repository (or extract the zip).
2.  Install dependencies:
    ```bash
    npm install
    ```

## Database Setup

Initialize and seed the SQLite database:
```bash
npm run seed
```
This script creates `db/app.db` and populates it with:
- Admin user (`admin` / `admin123`)
- 20+ Message Queues
- Random statistics and messages

## Running the Application

Start both the Backend (API) and Frontend (Web) concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

## Usage / Walkthrough

1.  **Login**:
    - Go to `http://localhost:3000`.
    - Credentials: `admin` / `admin123`.
    - You will be redirected to the Desktop page.

2.  **Navigation**:
    - On the Desktop page, use the **Search Bar** in the top-left.
    - Type **"Admin"** (case-insensitive) and press **Enter**.
    - You will be navigated to the Admin area.

3.  **Monitoring**:
    - In the Admin area, look at the **Left Navigation**.
    - Expand **Monitoring** -> Click **Message Queues**.
    - You will see a list of message queues with statuses (Started, Stopped, Error).

4.  **Details**:
    - Click on any **Destination Name** (e.g., "Near Real Time Alerts").
    - You will see the **Total Statistics** and **Detailed Statistics**.
    - The bottom table lists messages. Click "Show More" on long error messages to expand them.
