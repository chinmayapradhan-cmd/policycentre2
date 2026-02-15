# Deploying to Vercel

This guide explains how to deploy the PolicyCenter Replica (Monorepo) to Vercel.

## Prerequisites

- **Vercel Account**: You need an account at [vercel.com](https://vercel.com).
- **Vercel CLI** (Optional but recommended): Install via `npm i -g vercel`.
- **Git Repository**: Your project should be pushed to a Git repository (GitHub, GitLab, Bitbucket).

## Deployment Steps

1.  **Login to Vercel CLI** (if using CLI):
    ```bash
    vercel login
    ```

2.  **Deploy**:
    Run the deploy command from the **root** of your project:
    ```bash
    vercel
    ```
    - Follow the prompts.
    - Select the scope (your account).
    - Link to existing project: `N` (if new).
    - Project Name: `policycenter-replica` (or your choice).
    - Directory: `./` (Root).
    - **Build Settings**: Vercel should auto-detect the `vercel.json` configuration. If asked about overrides, you can mostly skip/use defaults because `vercel.json` handles the `builds` setup.

3.  **Environment Variables**:
    You need to set environment variables in the Vercel Dashboard or via CLI.
    
    **Frontend (`apps/web`):**
    - `NEXT_PUBLIC_API_BASE_URL`: The URL of your deployed backend. 
      *Initial deployment might be tricky because you don't know the URL yet. You can deploy once, get the URL, then update this variable and redeploy.*
      *Example:* `https://your-project-name.vercel.app/api`

    **Backend (`apps/api`):**
    - `CORS_ORIGIN`: The URL of your frontend.
      *Example:* `https://your-project-name.vercel.app`
    - `PORT`: Vercel handles this automatically, but you can set `3000` or `4000` just in case (though mostly ignored in serverless).

## Important Notes

### 1. Database Persistence (SQLite)
> [!WARNING]
> **This application uses SQLite (`db/app.db`).**
> Vercel Serverless Functions have an **ephemeral filesystem**. This means:
> - You can **READ** from the database (if seeded/included in build).
> - Any **WRITES** (new users, updates) will remain only for that specific function execution and will be **LOST** immediately after.
> 
> **For a persistent application, you MUST migrate to an external database like Vercel Postgres, Supabase, or MongoDB and update `apps/api/src/db.ts` to connect to it.**

### 2. Monorepo Structure
The `vercel.json` file is configured to independently build:
- `apps/web` using `@vercel/next`
- `apps/api` using `@vercel/node`

It routes traffic:
- `/api/*` -> `apps/api`
- `/*` -> `apps/web`

## Troubleshooting

### SSL Error: "unable to get local issuer certificate"
If you are on a corporate network (like Capgemini) and see this error when logging in, it means Node.js cannot verify the SSL certificate.

**Workaround (PowerShell):**
Run this command to temporarily disable strict SSL checking for the current session:
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npx vercel login
```

Then deploy with:
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npx vercel
```
