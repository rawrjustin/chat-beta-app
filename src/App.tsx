import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { PricingPage } from './pages/PricingPage';
import { CharactersPage } from './pages/CharactersPage';
import mixpanel from 'mixpanel-browser';

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    mixpanel.track('Page View', {
      page_url: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

function App() {
  return (
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
          path="/pricing"
          element={
            <Layout>
              <PricingPage />
            </Layout>
          }
        />
        <Route
          path="/characters"
          element={
            <Layout>
              <CharactersPage />
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
  );
}

export default App;

