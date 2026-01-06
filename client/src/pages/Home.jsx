import { Link } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '../components/AuthModal';
import { useAuthStore } from '../store/authStore';

// Example generated images for showcase
const EXAMPLE_IMAGES = [
  { theme: 'Game of Thrones', emoji: '🐉' },
  { theme: 'Classic', emoji: '📜' },
  { theme: 'Harry Potter', emoji: '⚡' },
];

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-50 to-surface-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌳</span>
              <span className="font-serif text-xl font-bold text-gray-900">AI Family Tree</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/gallery" className="text-gray-600 hover:text-gray-900 font-medium">
                Gallery
              </Link>
              {isAuthenticated ? (
                <Link to="/builder" className="btn-primary">
                  Create Tree
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </button>
                  <Link to="/builder" className="btn-primary">
                    Create Tree
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            ✨ AI-Powered Family Trees
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight">
            Transform Your Family Story
            <span className="block text-primary-500">Into Art</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-slide-up">
            Add your family members, choose a stunning theme, and watch as AI 
            creates a beautiful, one-of-a-kind family tree artwork in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <Link to="/builder" className="btn-primary text-lg px-10 py-4">
              Start Building — Free
            </Link>
            <a href="#themes" className="btn-secondary text-lg px-10 py-4">
              Explore Themes
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>AI-Generated Art</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Private & Secure</span>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-r from-primary-100 via-primary-50 to-primary-100 rounded-3xl p-8 md:p-12">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-4">
                {EXAMPLE_IMAGES.map((example, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-surface-100 to-surface-200 rounded-xl flex flex-col items-center justify-center text-gray-400"
                  >
                    <span className="text-5xl mb-2">{example.emoji}</span>
                    <p className="text-sm font-medium">{example.theme}</p>
                    <p className="text-xs">Theme Preview</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-400 mt-4 text-sm">
                AI-generated family trees will appear here after generation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Create your family tree in three simple steps
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: '👥',
              title: 'Add Family Members',
              description: 'Enter names, birth years, and upload photos for each family member. As many as you like!',
            },
            {
              step: '02',
              icon: '🎭',
              title: 'Choose a Theme',
              description: 'Pick from elegant classics or fun themes inspired by Game of Thrones, Simpsons, and more.',
            },
            {
              step: '03',
              icon: '✨',
              title: 'Generate with AI',
              description: 'Watch as our AI creates a stunning, unique family tree artwork in about 30 seconds.',
            },
          ].map((feature) => (
            <div key={feature.step} className="card-hover text-center relative">
              <div className="absolute -top-4 left-6 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                {feature.step}
              </div>
              <div className="text-5xl mb-4 mt-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Themes Section */}
      <section id="themes" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              ⭐ Premium Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Style</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From elegant classics to fun pop culture themes. Each one creates a unique artistic style for your family tree.
            </p>
          </div>

          {/* Free Themes */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6 text-center">Free Themes</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'Classic', emoji: '📜', desc: 'Elegant parchment style' },
                { name: 'Modern', emoji: '✨', desc: 'Clean, minimal design' },
                { name: 'Vintage', emoji: '🎞️', desc: 'Art Deco elegance' },
                { name: 'Minimalist', emoji: '⚪', desc: 'Ultra-simple beauty' },
              ].map((theme) => (
                <div
                  key={theme.name}
                  className="bg-surface-50 rounded-2xl p-6 text-center border-2 border-surface-200 hover:border-primary-300 transition-colors"
                >
                  <div className="text-4xl mb-3">{theme.emoji}</div>
                  <h4 className="font-semibold text-lg">{theme.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{theme.desc}</p>
                  <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Free
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Themes */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center">Premium Themes</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'Game of Thrones', emoji: '🐉', color: 'from-amber-900 to-amber-700', desc: 'Medieval house lineage' },
                { name: 'The Simpsons', emoji: '🍩', color: 'from-yellow-400 to-yellow-500', desc: 'Springfield cartoon fun' },
                { name: 'Harry Potter', emoji: '⚡', color: 'from-purple-900 to-purple-700', desc: 'Magical wizarding style' },
                { name: 'Peaky Blinders', emoji: '🎩', color: 'from-gray-900 to-gray-700', desc: '1920s noir aesthetic' },
              ].map((theme) => (
                <div
                  key={theme.name}
                  className={`bg-gradient-to-br ${theme.color} rounded-2xl p-6 text-white text-center cursor-pointer hover:scale-105 transition-transform shadow-lg`}
                >
                  <div className="text-4xl mb-3">{theme.emoji}</div>
                  <h4 className="font-semibold text-lg">{theme.name}</h4>
                  <p className="text-sm text-white/80 mt-1">{theme.desc}</p>
                  <span className="inline-block mt-3 text-sm bg-white/20 px-3 py-1 rounded-full font-medium">
                    $4.99
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose AI Family Tree?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: '🎨', title: 'Unique AI Art', desc: 'Every family tree is a one-of-a-kind artwork created by advanced AI' },
            { icon: '📸', title: 'Photo Integration', desc: 'Your real family photos are composited into the generated artwork' },
            { icon: '⚡', title: 'Instant Generation', desc: 'Get your beautiful family tree in about 30 seconds' },
            { icon: '💾', title: 'Cloud Saved', desc: 'Your trees are saved to your account and accessible anywhere' },
            { icon: '📥', title: 'High-Quality Export', desc: 'Download print-ready images perfect for framing' },
            { icon: '🔄', title: 'Unlimited Regeneration', desc: 'Not happy? Regenerate for a different artistic interpretation' },
          ].map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <div className="text-3xl flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-gray-600 text-center mb-12">Start free, upgrade when you need more</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="card text-center">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for trying it out</p>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 2 free generations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> All free themes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Basic export (watermarked)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Local save
                </li>
              </ul>
              <Link to="/builder" className="btn-secondary w-full">
                Get Started Free
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="card text-center border-2 border-primary-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-gray-600 mb-6">For serious family historians</p>
              <div className="text-4xl font-bold mb-2">$9.99<span className="text-lg text-gray-500">/mo</span></div>
              <p className="text-sm text-gray-500 mb-6">or purchase themes individually for $4.99 each</p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> <strong>Unlimited</strong> generations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> All premium themes included
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> No watermark exports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Cloud sync & backup
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Priority generation
                </li>
              </ul>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary w-full"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create Your Family Tree?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join families who have preserved their legacy with beautiful AI-generated artwork.
          </p>
          <Link to="/builder" className="btn-primary text-lg px-12 py-4">
            Start Building Now — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌳</span>
                <span className="font-serif text-xl font-bold text-white">AI Family Tree</span>
              </div>
              <p className="text-sm">
                Transform your family history into beautiful AI-generated artwork.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/builder" className="hover:text-white transition-colors">Create Tree</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                <li><a href="#themes" className="hover:text-white transition-colors">Themes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@aifamilytree.com" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 AI Family Tree Builder. Built with ❤️</p>
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
