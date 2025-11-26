import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { BetaSignupPage } from './pages/BetaSignupPage';
import { CharactersPage } from './pages/CharactersPage';
import { AdminPage } from './pages/AdminPage';
import mixpanel from 'mixpanel-browser';
import { withCharacterName, unregisterCharacterName } from './utils/mixpanel';

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Clear character_name super property when not on a chat page
    // This prevents character_name from leaking into events on other pages
    // (e.g., autocaptured clicks, form submissions) due to effect timing
    const isOnChatPage = location.pathname.startsWith('/chat/');
    if (!isOnChatPage) {
      unregisterCharacterName();
    }

    mixpanel.track('Page View', withCharacterName({
      page_url: window.location.href,
      page_title: document.title,
    }));
  }, [location]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <PageViewTracker />
        <Routes>
        <Route path="/chat/:configId" element={<ChatPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/beta-signup"
          element={
            <Layout>
              <BetaSignupPage />
            </Layout>
          }
        />
        <Route path="/pricing" element={<Navigate to="/beta-signup" replace />} />
        <Route
          path="/characters"
          element={
            <Layout>
              <CharactersPage />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminPage />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                  <a href="/" className="btn-primary inline-block">
                    Go Home
                  </a>
                </div>
              </div>
            </Layout>
          }
        />
      </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;

