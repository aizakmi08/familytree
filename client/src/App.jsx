import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const TreeBuilder = lazy(() => import('./pages/TreeBuilder'));
const Themes = lazy(() => import('./pages/Themes'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ModalProvider>
          <BrowserRouter>
            <Layout>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
                      <p className="text-[var(--color-text-secondary)]">Loading...</p>
                    </div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tree" element={<TreeBuilder />} />
                  <Route path="/themes" element={<Themes />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </ModalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
