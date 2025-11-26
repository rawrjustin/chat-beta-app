# Railway Deployment Guide

This guide will help you deploy the chat-beta-app frontend to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. Your backend already deployed on Railway in the `chat-beta-proxy` project
3. Git repository set up for this project

## Deployment Steps

### 1. Install Dependencies Locally (Optional - for testing)

```bash
npm install
```

This will install Express, which is needed to serve the static files.

### 2. Deploy to Railway

#### Option A: Using Railway Dashboard

1. Go to https://railway.app and create a new project
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `chat-beta-app` repository
4. Railway will automatically detect the project and start building

#### Option B: Using Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize and deploy:
   ```bash
   railway init
   railway up
   ```

### 3. Configure Environment Variables

In your Railway project dashboard:

1. Go to your service → Variables
2. Add the following environment variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://chat-beta-proxy-production.up.railway.app`

   (Or use your actual backend URL if different)

### 4. Configure Build Settings

Railway should automatically detect:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `/` (root of the project)

If not, you can manually set these in the Railway dashboard under your service settings.

### 5. Deploy and Test

1. Railway will automatically build and deploy your app
2. Once deployed, Railway will provide you with a public URL (e.g., `https://your-app-name.up.railway.app`)
3. Test the application to ensure it connects to your backend correctly

## How It Works

- The `server.js` file uses Express to serve the static files from the `dist` directory
- All routes are handled by serving `index.html` to support React Router (SPA routing)
- The build process compiles TypeScript and builds the Vite app into the `dist` directory
- Environment variables prefixed with `VITE_` are injected at build time

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json`
- Ensure Node.js version is compatible (Railway uses Node 18+ by default)

### App Doesn't Connect to Backend
- Verify `VITE_API_BASE_URL` is set correctly in Railway environment variables
- Check that your backend is accessible and CORS is configured properly
- Rebuild the app after changing environment variables (Railway should auto-rebuild)

### Routing Issues (404 on refresh)
- The `server.js` file handles SPA routing by serving `index.html` for all routes
- If you still see 404s, check that the server is correctly configured

## Notes

- Railway will automatically rebuild on every push to your main branch (if connected to GitHub)
- The `railway.json` file provides Railway with build and deploy configuration
- Make sure your backend CORS settings allow requests from your Railway frontend URL

