import { useState } from 'react';
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

  const allGenerations = generations || [];

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="glass border-b border-surface-800 sticky top-0 z-40">
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
            <div className="flex items-center gap-4">
              <Link to="/builder" className="btn-primary text-sm py-2">
                Create
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">My Creations</h1>
          <p className="text-gray-500 text-sm">
            {allGenerations.length} item{allGenerations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {allGenerations.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No creations yet</h2>
            <p className="text-gray-500 mb-6">Generate your first family tree</p>
            <Link to="/builder" className="btn-primary">
              Create
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGenerations.map((generation, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(generation)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-surface-900 border border-surface-800 hover:border-surface-600 cursor-pointer transition-all image-protection-container"
                onContextMenu={(e) => e.preventDefault()}
              >
                <img
                  src={generation.imageUrl}
                  alt={`Family Tree - ${generation.theme}`}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 protected-image"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent pointer-events-none" />
                {/* Preview badge on thumbnails */}
                {!generation.isPaid && (
                  <div className="absolute top-2 right-2 bg-surface-950/80 text-xs text-gray-400 px-2 py-1 rounded">
                    PREVIEW
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                  <p className="text-white font-medium capitalize">{generation.theme}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(generation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
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
          imageUrl={selectedImage.imageUrl}
          imageId={selectedImage.imageId}
          onClose={() => setSelectedImage(null)}
          onRegenerate={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
