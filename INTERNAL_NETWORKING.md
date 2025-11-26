# Internal Networking Setup

The frontend is now configured to communicate with the backend through Railway's internal network for improved efficiency and performance.

## How It Works

### Architecture

```
Browser → Frontend Server (public) → Backend (internal) → Frontend Server → Browser
```

1. **Browser requests**: The browser makes API requests to the frontend server using relative URLs (e.g., `/api/characters`)
2. **Frontend server proxy**: The Express server (`server.js`) proxies these requests to the backend using Railway's internal network
3. **Internal communication**: Requests travel over Railway's private network (`graceful-exploration.railway.internal`) - faster and more secure
4. **Response**: The backend responds through the internal network, and the frontend server forwards it to the browser

### Benefits

- ✅ **Faster**: Internal network communication is faster than going through public internet
- ✅ **More secure**: Traffic stays within Railway's private network
- ✅ **Lower latency**: No external DNS resolution or routing overhead
- ✅ **Cost efficient**: Internal traffic doesn't count against external bandwidth

## Configuration

### Environment Variables

- `BACKEND_INTERNAL_URL`: Set to `http://graceful-exploration.railway.internal:3000`
  - This is the backend's internal Railway domain
  - Used by the Express server to proxy API requests

- `VITE_API_BASE_URL`: Still set for fallback, but not used in production
  - The frontend uses relative URLs in production (empty string)
  - The server handles proxying to the backend

### Code Changes

1. **`server.js`**: Added Express proxy middleware to forward API requests to the backend
2. **`src/utils/api.ts`**: Updated to use relative URLs in production (proxied through server)
3. **`package.json`**: Added `http-proxy-middleware` dependency

## Fallback Behavior

If `BACKEND_INTERNAL_URL` is not set, the server will fall back to:
1. `BACKEND_URL` environment variable
2. `VITE_API_BASE_URL` environment variable  
3. `http://localhost:3000` (for local development)

## Troubleshooting

### If internal networking doesn't work:

1. **Check environment variables**:
   ```bash
   railway variables --service frontend
   ```

2. **Verify backend internal domain**:
   ```bash
   railway variables --service backend | grep RAILWAY_PRIVATE_DOMAIN
   ```

3. **Check server logs** for proxy errors:
   ```bash
   railway logs --service frontend
   ```

4. **Test internal connectivity**: The server logs will show which backend URL it's using:
   ```
   Backend URL configured: http://graceful-exploration.railway.internal:3000
   ```

### Port Configuration

If the backend uses a different port, update `BACKEND_INTERNAL_URL`:
```bash
railway variables --set "BACKEND_INTERNAL_URL=http://graceful-exploration.railway.internal:PORT" --service frontend
```

Or set `BACKEND_PORT` environment variable and the server will append it automatically.

## Development

In local development:
- The frontend uses `VITE_API_BASE_URL` or `http://localhost:3000`
- No proxy is needed - requests go directly to the backend
- Internal networking only applies in Railway production environment

