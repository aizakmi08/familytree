import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFamilyStore } from '../store/familyStore';
import { useAuthStore } from '../store/authStore';
import AddMemberModal from '../components/AddMemberModal';
import MemberCard from '../components/MemberCard';
import RelationshipList from '../components/RelationshipList';
import FamilyTreeDiagram from '../components/FamilyTreeDiagram';
import AuthModal from '../components/AuthModal';
import LoadingOverlay from '../components/LoadingOverlay';
import GenerationResult from '../components/GenerationResult';
import { generateFamilyTree, checkGenerationStatus } from '../utils/api';
import { getStandardThemes, getFunThemes, getNatureThemes, getTheme } from '../themes/themes';

const STANDARD_THEMES = getStandardThemes();
const FUN_THEMES = getFunThemes();
const NATURE_THEMES = getNatureThemes();
const ALL_THEMES = [...STANDARD_THEMES, ...FUN_THEMES, ...NATURE_THEMES];

export default function Builder() {
  const { members, relationships, selectedTheme, setTheme, treeName, setTreeName, canGenerate, getTreeData, addGeneration, setGenerating, isGenerating } = useFamilyStore();
  const { isAuthenticated, token, user, logout } = useAuthStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [generatedImageId, setGeneratedImageId] = useState(null);
  const [error, setError] = useState('');
  const [apiReady, setApiReady] = useState(true);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [customThemePrompt, setCustomThemePrompt] = useState('');

  useEffect(() => {
    checkGenerationStatus()
      .then((status) => setApiReady(status.ready))
      .catch(() => setApiReady(false));
  }, []);

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingMember(null);
  };

  const handleGenerate = async () => {
    if (!canGenerate()) return;

    setError('');
    setGenerating(true);

    try {
      const treeData = getTreeData();

      if (selectedTheme === 'custom' && customThemePrompt) {
        treeData.customPrompt = customThemePrompt;
      }

      const result = await generateFamilyTree(treeData, isAuthenticated ? token : null);

      setGeneratedImageUrl(result.imageUrl);
      setGeneratedImageId(result.imageId); // Secure ID - clean URL stays server-side
      addGeneration({
        imageUrl: result.imageUrl,
        imageId: result.imageId,
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
    setGeneratedImageId(null);
    handleGenerate();
  };

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
    setShowCustomTheme(themeId === 'custom');
  };

  const currentTheme = getTheme(selectedTheme);

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-surface-800">
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
              <Link to="/gallery" className="text-sm text-gray-400 hover:text-white transition-colors">
                Gallery
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{user?.name}</span>
                  <button onClick={logout} className="text-sm text-gray-500 hover:text-white transition-colors">
                    Sign Out
                  </button>
                </div>
              ) : (
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
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Tree Name Input */}
          <div className="mb-8">
            <label className="block text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Tree Name (appears on final image)
              </span>
            </label>
            <div className="relative group">
              <input
                type="text"
                value={treeName}
                onChange={(e) => setTreeName(e.target.value)}
                placeholder="Enter your family tree name..."
                className="w-full text-2xl md:text-3xl font-serif font-bold bg-surface-900 border-2 border-surface-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all hover:border-surface-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-gray-400 transition-colors pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              {members.length} member{members.length !== 1 ? 's' : ''} · {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* API Status Warning */}
          {!apiReady && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg text-sm">
              Generation requires API configuration. Check server settings.
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Family Members */}
            <div className="lg:col-span-2 space-y-6">
              {/* Family Members */}
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">Family Members</h2>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary text-sm py-2"
                  >
                    Add Member
                  </button>
                </div>

                {members.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-surface-700 rounded-lg">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-2">No members yet</p>
                    <p className="text-gray-600 text-sm mb-4">Start by adding your family members</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="btn-secondary text-sm"
                    >
                      Add First Member
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onEdit={handleEditMember}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Relationships */}
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Relationships</h2>
                {members.length < 2 ? (
                  <p className="text-gray-500 text-sm">Add at least 2 members to define relationships</p>
                ) : (
                  <RelationshipList />
                )}
              </div>

              {/* Tree Visualization */}
              {members.length >= 2 && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-white mb-4">Tree Preview</h2>
                  <div className="bg-surface-800/50 rounded-lg border border-surface-700 overflow-hidden">
                    <FamilyTreeDiagram onEditMember={handleEditMember} />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Click on a member to edit
                  </p>
                </div>
              )}
            </div>

            {/* Right: Theme & Generate */}
            <div className="space-y-6">
              {/* Theme Selection */}
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Theme</h2>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        selectedTheme === theme.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-surface-700 hover:border-surface-600 bg-surface-800'
                      }`}
                    >
                      <div className="text-xl mb-1">{theme.emoji}</div>
                      <span className="text-xs text-gray-400">{theme.name}</span>
                    </button>
                  ))}
                  {/* Custom Theme */}
                  <button
                    onClick={() => handleThemeSelect('custom')}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      selectedTheme === 'custom'
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-surface-700 hover:border-surface-600 bg-surface-800'
                    }`}
                  >
                    <div className="text-xl mb-1">+</div>
                    <span className="text-xs text-gray-400">Custom</span>
                  </button>
                </div>

                {showCustomTheme && (
                  <div className="mt-4">
                    <textarea
                      value={customThemePrompt}
                      onChange={(e) => setCustomThemePrompt(e.target.value)}
                      placeholder="Describe your theme..."
                      className="input text-sm resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate() || isGenerating || !apiReady || (selectedTheme === 'custom' && !customThemePrompt)}
                className="w-full btn-primary py-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Generating...
                  </span>
                ) : (
                  'Generate'
                )}
              </button>

              {!canGenerate() && (
                <p className="text-center text-xs text-gray-600">
                  Add 2+ members and 1+ relationship
                </p>
              )}

              {/* Progress */}
              <div className="card">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Checklist</h3>
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${members.length >= 2 ? 'text-primary-400' : 'text-gray-600'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${members.length >= 2 ? 'border-primary-400 bg-primary-400/20' : 'border-gray-600'}`}>
                      {members.length >= 2 && (
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    2+ members
                  </div>
                  <div className={`flex items-center gap-2 ${relationships.length >= 1 ? 'text-primary-400' : 'text-gray-600'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${relationships.length >= 1 ? 'border-primary-400 bg-primary-400/20' : 'border-gray-600'}`}>
                      {relationships.length >= 1 && (
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    1+ relationship
                  </div>
                  <div className="flex items-center gap-2 text-primary-400">
                    <div className="w-4 h-4 rounded-full border border-primary-400 bg-primary-400/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Theme: {currentTheme?.name || 'Custom'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        editMember={editingMember}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LoadingOverlay
        isVisible={isGenerating}
        theme={currentTheme?.name}
      />

      {generatedImageUrl && (
        <GenerationResult
          imageUrl={generatedImageUrl}
          imageId={generatedImageId}
          onClose={() => {
            setGeneratedImageUrl(null);
            setGeneratedImageId(null);
          }}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
}
