import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFamilyStore } from '../store/familyStore';
import AuthModal from '../components/AuthModal';
import GenerationResult from '../components/GenerationResult';

export default function Gallery() {
  const { isAuthenticated, user } = useAuthStore();
  const { generations } = useFamilyStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Combine local generations with any from the store
  const allGenerations = generations || [];

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌳</span>
              <span className="font-serif text-xl font-bold text-gray-900">AI Family Tree</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/builder" className="btn-primary">
                Create New
              </Link>
              {isAuthenticated ? (
                <span className="text-sm text-gray-600">{user?.name}</span>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-secondary text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Family Trees</h1>
          <p className="text-gray-500">
            {allGenerations.length} generation{allGenerations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {allGenerations.length === 0 ? (
          /* Empty State */
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🖼️</div>
            <h2 className="text-2xl font-bold mb-2">No trees yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first AI-generated family tree!
            </p>
            <Link to="/builder" className="btn-primary">
              Create Your First Tree
            </Link>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGenerations.map((generation, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(generation.imageUrl)}
                className="card-hover cursor-pointer overflow-hidden"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={generation.imageUrl}
                    alt={`Family Tree - ${generation.theme}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white">
                      <p className="font-semibold capitalize">{generation.theme} Theme</p>
                      <p className="text-sm text-white/80">
                        {new Date(generation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium capitalize">{generation.theme} Theme</p>
                  <p className="text-sm text-gray-500">
                    {new Date(generation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sign in prompt for guests */}
        {!isAuthenticated && allGenerations.length > 0 && (
          <div className="mt-8 card bg-primary-50 border-primary-200 text-center">
            <p className="text-primary-800 mb-4">
              <strong>Sign in</strong> to save your family trees to the cloud and access them anywhere!
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary"
            >
              Sign In to Save
            </button>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* View Image Modal */}
      {selectedImage && (
        <GenerationResult
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          onRegenerate={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
