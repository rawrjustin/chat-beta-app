import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Determine backend URL - use internal Railway network if available, otherwise use public URL
// Railway provides BACKEND_INTERNAL_URL for internal communication, or fall back to VITE_API_BASE_URL
// If BACKEND_INTERNAL_URL is set but doesn't include a port, append the backend port (default 3000)
let BACKEND_URL = 
  process.env.BACKEND_INTERNAL_URL || 
  process.env.BACKEND_URL || 
  process.env.VITE_API_BASE_URL || 
  'http://localhost:3000';

// If using internal URL without port, add default port (Railway internal domains may need explicit port)
if (BACKEND_URL.includes('.railway.internal') && !BACKEND_URL.match(/:\d+$/)) {
  const BACKEND_PORT = process.env.BACKEND_PORT || '3000';
  BACKEND_URL = `${BACKEND_URL}:${BACKEND_PORT}`;
}

console.log(`Backend URL configured: ${BACKEND_URL}`);

// Local health check endpoint (responds immediately without proxying to backend)
// This ensures Railway health checks pass even if backend is temporarily unavailable
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'frontend' });
});

// Proxy API requests to backend using internal network
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // Keep /api prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${BACKEND_URL}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

// Proxy admin endpoints
app.use('/admin', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
}));

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.send(indexHtml);
  } catch (error) {
    res.status(500).send('Error loading application');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxying API requests to: ${BACKEND_URL}`);
});

