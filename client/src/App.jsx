import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import TreeBuilder from './pages/TreeBuilder';
import Themes from './pages/Themes';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
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
  );
}

export default App;
