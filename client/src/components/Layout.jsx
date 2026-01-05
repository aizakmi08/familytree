import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center">
                <span className="text-white font-serif text-xl">T</span>
              </div>
              <span className="font-serif text-xl font-semibold text-[var(--color-text-primary)]">
                FamilyTree
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/themes"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/themes'
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Themes
              </Link>
              <button className="btn-secondary text-sm">Sign In</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white/60 border-t border-[var(--color-border)] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-[var(--color-text-secondary)] text-sm">
            <p>© 2026 FamilyTree Builder. Built with care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

