import { Link } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '../components/AuthModal';
import { useAuthStore } from '../store/authStore';

// Example family tree images - replace with actual generated examples
const EXAMPLE_TREES = [
  {
    id: 1,
    theme: 'Classic',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&h=400&fit=crop&auto=format',
    placeholder: true
  },
  {
    id: 2,
    theme: 'Game of Thrones',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&auto=format',
    placeholder: true
  },
  {
    id: 3,
    theme: 'Harry Potter',
    image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=400&fit=crop&auto=format',
    placeholder: true
  },
  {
    id: 4,
    theme: 'Botanical',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop&auto=format',
    placeholder: true
  },
  {
    id: 5,
    theme: 'Vintage',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop&auto=format',
    placeholder: true
  },
  {
    id: 6,
    theme: 'Celestial',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop&auto=format',
    placeholder: true
  },
];

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-surface-950" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
              </div>
              <span className="font-serif text-lg font-semibold text-white">Heritage</span>
            </Link>
            <div className="flex items-center gap-6">
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Your Family Story,
            <span className="block text-gradient">Beautifully Crafted</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Transform your family history into stunning AI-generated artwork.
            Upload photos, choose a theme, and create something worth framing.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 btn-primary text-base px-8 py-4"
          >
            Start Creating
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Example Gallery */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Explore Themes</h2>
            <p className="text-gray-500">Each theme brings a unique artistic style to your family tree</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXAMPLE_TREES.map((example) => (
              <Link
                key={example.id}
                to="/builder"
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-900 border border-surface-800 hover:border-surface-600 transition-all duration-300"
              >
                <img
                  src={example.image}
                  alt={`${example.theme} theme example`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-medium">{example.theme}</p>
                  <p className="text-gray-400 text-sm">Theme</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1 bg-surface-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                    Try it
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-surface-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-500">Three simple steps to create your masterpiece</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
      <section className="py-20 px-6 border-t border-surface-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
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
      <section className="py-24 px-6 border-t border-surface-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Begin?</h2>
          <p className="text-gray-500 mb-8">
            Create a beautiful family tree that captures your heritage.
          </p>
          <Link to="/builder" className="inline-flex items-center gap-2 btn-primary px-8 py-4">
            Start Creating
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-surface-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-surface-950" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm">Heritage</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="mailto:support@heritage.com" className="hover:text-gray-300 transition-colors">Contact</a>
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
