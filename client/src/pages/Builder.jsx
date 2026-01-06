import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFamilyStore } from '../store/familyStore';
import { useAuthStore } from '../store/authStore';
import AddMemberModal from '../components/AddMemberModal';
import MemberCard from '../components/MemberCard';
import RelationshipSelector from '../components/RelationshipSelector';
import RelationshipList from '../components/RelationshipList';
import AuthModal from '../components/AuthModal';
import LoadingOverlay from '../components/LoadingOverlay';
import GenerationResult from '../components/GenerationResult';
import { generateFamilyTree, checkGenerationStatus } from '../utils/api';
import { getTheme } from '../themes/themes';

const FREE_THEMES = [
  { id: 'classic', name: 'Classic', emoji: '📜' },
  { id: 'modern', name: 'Modern', emoji: '✨' },
  { id: 'vintage', name: 'Vintage', emoji: '🎞️' },
  { id: 'minimalist', name: 'Minimalist', emoji: '⚪' },
];

const PREMIUM_THEMES = [
  { id: 'gameOfThrones', name: 'Game of Thrones', emoji: '🐉', price: 4.99 },
  { id: 'simpsons', name: 'The Simpsons', emoji: '🍩', price: 4.99 },
  { id: 'harryPotter', name: 'Harry Potter', emoji: '⚡', price: 4.99 },
  { id: 'peakyBlinders', name: 'Peaky Blinders', emoji: '🎩', price: 4.99 },
];

export default function Builder() {
  const { members, relationships, selectedTheme, setTheme, canGenerate, getTreeData, addGeneration, setGenerating, isGenerating } = useFamilyStore();
  const { isAuthenticated, token, user } = useAuthStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [relationshipFromMember, setRelationshipFromMember] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [apiReady, setApiReady] = useState(true);

  useEffect(() => {
    checkGenerationStatus()
      .then((status) => setApiReady(status.ready))
      .catch(() => setApiReady(false));
  }, []);

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsAddModalOpen(true);
  };

  const handleAddRelationship = (member) => {
    setRelationshipFromMember(member);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingMember(null);
  };

  const handleGenerate = async () => {
    if (!canGenerate()) return;

    // Check if premium theme and user needs to purchase
    const isPremiumTheme = PREMIUM_THEMES.some((t) => t.id === selectedTheme);
    if (isPremiumTheme) {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        setError('Please sign in to use premium themes');
        return;
      }
      // Check if user has purchased theme
      if (!user?.purchasedThemes?.includes(selectedTheme) && !user?.isPremium) {
        setError(`Purchase the ${getTheme(selectedTheme).name} theme to use it`);
        return;
      }
    }

    setError('');
    setGenerating(true);

    try {
      const treeData = getTreeData();
      const result = await generateFamilyTree(treeData, isAuthenticated ? token : null);
      
      setGeneratedImageUrl(result.imageUrl);
      addGeneration({
        imageUrl: result.imageUrl,
        theme: selectedTheme,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedImageUrl(null);
    handleGenerate();
  };

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
              <Link to="/gallery" className="text-gray-600 hover:text-gray-900 font-medium">
                Gallery
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  {user?.isPremium && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
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
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        {/* API Status Warning */}
        {!apiReady && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl">
            <strong>Note:</strong> AI generation requires an OpenAI API key. Please configure OPENAI_API_KEY in the server .env file.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Family Members & Relationships */}
          <div className="lg:col-span-2 space-y-6">
            {/* Family Members */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Family Members</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {members.length} member{members.length !== 1 ? 's' : ''} added
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary"
                >
                  + Add Member
                </button>
              </div>
              
              {members.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
                  <p className="text-lg mb-2">No family members yet</p>
                  <p className="text-sm">Click "Add Member" to start building your family tree</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onEdit={handleEditMember}
                      onAddRelationship={handleAddRelationship}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Relationships */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Relationships</h2>
              {members.length < 2 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Add at least 2 family members to define relationships</p>
                </div>
              ) : (
                <RelationshipList />
              )}
            </div>
          </div>

          {/* Right: Theme Selection & Generate */}
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Select Theme</h2>
              
              {/* Free Themes */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {FREE_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedTheme === theme.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{theme.emoji}</div>
                    <span className="text-sm font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
              
              {/* Premium Themes */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span> Premium Themes
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {PREMIUM_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center relative ${
                        selectedTheme === theme.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="absolute top-1 right-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                        ${theme.price}
                      </div>
                      <div className="text-2xl mb-1">{theme.emoji}</div>
                      <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate() || isGenerating || !apiReady}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Generating...
                  </span>
                ) : (
                  '✨ Generate Family Tree'
                )}
              </button>
              {!canGenerate() && (
                <p className="text-center text-sm text-gray-500">
                  Add at least 2 members and 1 relationship to generate
                </p>
              )}
            </div>

            {/* Progress Summary */}
            <div className="card bg-gray-50">
              <h3 className="font-semibold mb-3">Ready to Generate?</h3>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${members.length >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                  {members.length >= 2 ? '✅' : '⬜'} At least 2 family members
                </div>
                <div className={`flex items-center gap-2 ${relationships.length >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                  {relationships.length >= 1 ? '✅' : '⬜'} At least 1 relationship defined
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  ✅ Theme selected: {[...FREE_THEMES, ...PREMIUM_THEMES].find(t => t.id === selectedTheme)?.name}
                </div>
              </div>
            </div>

            {/* Credits info */}
            {isAuthenticated && !user?.isPremium && (
              <div className="card bg-primary-50 border-primary-200">
                <p className="text-sm text-primary-800">
                  <strong>{user?.generationCredits || 0}</strong> free generations remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        editMember={editingMember}
      />
      
      <RelationshipSelector
        isOpen={!!relationshipFromMember}
        onClose={() => setRelationshipFromMember(null)}
        fromMember={relationshipFromMember}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LoadingOverlay
        isVisible={isGenerating}
        theme={[...FREE_THEMES, ...PREMIUM_THEMES].find(t => t.id === selectedTheme)?.name}
      />

      {generatedImageUrl && (
        <GenerationResult
          imageUrl={generatedImageUrl}
          onClose={() => setGeneratedImageUrl(null)}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
}
