import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-6">
          Build Your Family Tree
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8">
          Create beautiful, personalized family trees with ease. Add photos, choose themes,
          and share your family's story.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/tree" className="btn-primary text-lg px-8 py-3">
            Start Building
          </Link>
          <Link to="/themes" className="btn-secondary text-lg px-8 py-3">
            Browse Themes
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mt-20">
        <div className="card text-center">
          <div className="w-12 h-12 bg-[var(--color-accent)]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Easy to Use</h3>
          <p className="text-[var(--color-text-secondary)]">
            Simply add names, photos, and relationships. No complicated setup required.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-[var(--color-accent)]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Beautiful Themes</h3>
          <p className="text-[var(--color-text-secondary)]">
            Choose from free and premium themes to match your style.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-[var(--color-accent)]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Export & Share</h3>
          <p className="text-[var(--color-text-secondary)]">
            Export your tree as PDF or share it with family members.
          </p>
        </div>
      </div>
    </div>
  );
}

