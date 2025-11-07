# Render Static Site Redirects Setup

To fix 404 errors when refreshing or directly accessing routes (like `/characters`, `/chat/:id`, etc.), you need to configure redirects in the Render dashboard.

## Steps to Configure Redirects on Render:

1. Go to your Render dashboard: https://dashboard.render.com
2. Navigate to your static site service (chat-beta-app)
3. Click on **Settings**
4. Scroll down to **Redirects and Rewrites** section
5. Click **Add Redirect**
6. Configure the redirect:
   - **Source Path**: `/*`
   - **Destination Path**: `/index.html`
   - **Action**: Select **Rewrite** (not Redirect)
7. Click **Save**

This will ensure all routes are served through `index.html`, allowing React Router to handle client-side routing.

## Why This is Needed:

When you refresh a page like `/characters`, the browser makes a request to the server for that specific path. Without the redirect rule, the server returns 404 because that file doesn't exist. The redirect rule tells Render to serve `index.html` for all routes, allowing React Router to handle the routing on the client side.

