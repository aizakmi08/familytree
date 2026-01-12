import { Link } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '../components/AuthModal';
import { useAuthStore } from '../store/authStore';

// Mobile menu component
function MobileMenu({ isOpen, onClose, isAuthenticated, onSignIn }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-64 bg-surface-900 border-l border-surface-800 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav className="mt-8 flex flex-col gap-4">
          <Link to="/gallery" onClick={onClose} className="text-gray-300 hover:text-white py-2 transition-colors">
            Gallery
          </Link>
          {isAuthenticated ? (
            <Link to="/builder" onClick={onClose} className="btn-primary text-center">
              Create
            </Link>
          ) : (
            <>
              <button onClick={() => { onClose(); onSignIn(); }} className="text-gray-300 hover:text-white py-2 text-left transition-colors">
                Sign In
              </button>
              <Link to="/builder" onClick={onClose} className="btn-primary text-center">
                Create
              </Link>
            </>
          )}
          <div className="border-t border-surface-700 my-4" />
          <Link to="/privacy" onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm py-1">Privacy</Link>
          <Link to="/terms" onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm py-1">Terms</Link>
          <Link to="/contact" onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm py-1">Contact</Link>
        </nav>
      </div>
    </div>
  );
}

// Showcase of actual generated family trees
const SHOWCASE_TREES = [
  {
    id: 1,
    theme: 'Classic',
    description: 'Elegant traditional family tree design',
    image: '/classic.png',
  },
  {
    id: 2,
    theme: 'Game of Thrones',
    description: 'Medieval fantasy house banner style',
    image: '/gameofthrones.png',
  },
  {
    id: 3,
    theme: 'Harry Potter',
    description: 'Magical wizarding world portraits',
    image: '/harrypotter.png',
  },
  {
    id: 4,
    theme: 'The Simpsons',
    description: 'Animated cartoon family style',
    image: '/simpsons.png',
  },
  {
    id: 5,
    theme: 'Vintage',
    description: 'Antique sepia-toned heritage look',
    image: '/vintage.png',
  },
  {
    id: 6,
    theme: 'Botanical',
    description: 'Nature-inspired floral design',
    image: '/botanical.png',
  },
  {
    id: 7,
    theme: 'Custom',
    description: 'Create your own unique style',
    image: '/customf1.png',
  },
  {
    id: 8,
    theme: 'Your Theme',
    description: 'Design any style you imagine',
    image: null,
    isCustomCTA: true,
  },
];

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-surface-950" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
              </div>
              <span className="font-serif text-lg font-semibold text-white">Heritage</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/gallery" className="text-gray-400 hover:text-white text-sm transition-colors">
                Gallery
              </Link>
              {isAuthenticated ? (
                <Link to="/builder" className="btn-primary text-sm py-2">
                  Create
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Sign In
                  </button>
                  <Link to="/builder" className="btn-primary text-sm py-2">
                    Create
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        onSignIn={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
            Your Family Story,
            <span className="block text-gradient">Beautifully Crafted</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Transform your family history into stunning AI-generated artwork.
            Upload photos, choose a theme, and create something worth framing.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
          >
            Start Creating
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Showcase Gallery */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-block text-primary-400 text-xs font-medium tracking-widest uppercase mb-2">Themes</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Explore Styles</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {SHOWCASE_TREES.map((item) => (
              <Link
                key={item.id}
                to="/builder"
                className={`group relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 ${
                  item.isCustomCTA
                    ? 'bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-2 border-dashed border-primary-500/40 hover:border-primary-400'
                    : 'bg-surface-900 border border-surface-800/50 hover:border-primary-500/40'
                }`}
              >
                {item.isCustomCTA ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="text-white text-sm font-medium mb-1">Your Theme</h3>
                    <p className="text-gray-400 text-xs">Create any style</p>
                  </div>
                ) : (
                  <>
                    <img
                      src={item.image}
                      alt={`${item.theme} theme`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white text-sm font-medium truncate">{item.theme}</h3>
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-surface-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">How It Works</h2>
            <p className="text-gray-500 text-sm sm:text-base">Three simple steps to create your masterpiece</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Add Members',
                description: 'Enter names, dates, and upload photos of your family members.',
              },
              {
                step: '02',
                title: 'Choose Theme',
                description: 'Select from classic, fantasy, botanical, and more artistic styles.',
              },
              {
                step: '03',
                title: 'Generate',
                description: 'AI creates a unique artwork based on your family and chosen theme.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-800 border border-surface-700 mb-4">
                  <span className="text-primary-400 font-mono text-sm">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-surface-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { icon: '01', title: 'Photo Integration', desc: 'Real photos composited into artistic scenes' },
              { icon: '02', title: 'HD Quality', desc: 'Print-ready 2K resolution output' },
              { icon: '03', title: '10+ Themes', desc: 'Classic, fantasy, nature, and more' },
              { icon: '04', title: 'Fast Generation', desc: 'Your artwork ready in 30 seconds' },
            ].map((feature) => (
              <div key={feature.icon} className="flex gap-4 p-5 rounded-xl bg-surface-900 border border-surface-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center">
                  <span className="text-primary-400 font-mono text-xs">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-surface-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to Begin?</h2>
          <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
            Create a beautiful family tree that captures your heritage.
          </p>
          <Link to="/builder" className="inline-flex items-center gap-2 btn-primary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">
            Start Creating
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-surface-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-surface-950" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm">Heritage</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/purchases" className="hover:text-gray-300 transition-colors">My Purchases</Link>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
