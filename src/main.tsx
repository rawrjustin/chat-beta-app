import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
//Import Mixpanel SDK
import mixpanel from "mixpanel-browser";

// Near entry of your product, init Mixpanel
mixpanel.init("23ee8d31c56343ee2d65151d8d88aa1f", {
    debug: true,
    track_pageview: true,
    persistence: "localStorage",
    autocapture: true,
    record_sessions_percent: 100,
    ignore_dnt: true,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

