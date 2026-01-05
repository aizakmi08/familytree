import { useState } from 'react';
import { Link } from 'react-router-dom';
import AddPersonModal from './AddPersonModal';
import EditPersonModal from './EditPersonModal';
import ExportModal from './ExportModal';
import { useTreeStore } from '../store/treeStore';
import { useAuthStore } from '../store/authStore';
import { useModal } from '../contexts/ModalContext';
import { syncTreeToCloud, promptSaveToCloud } from '../utils/sync';

export default function Toolbar({ treeElement }) {
  const { undo, redo, history, historyIndex, tree } = useTreeStore();
  const { isAuthenticated } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const {
    addPersonModal,
    openAddPersonModal,
    closeAddPersonModal,
    editPersonModal,
    closeEditPersonModal,
  } = useModal();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSaveToCloud = async () => {
    if (!isAuthenticated) {
      const shouldSave = promptSaveToCloud();
      if (shouldSave) {
        // Open auth modal - handled by Layout component
        return;
      }
      return;
    }

    setIsSyncing(true);
    const result = await syncTreeToCloud(tree);
    setIsSyncing(false);

    if (result.success) {
      alert('Tree saved to cloud successfully!');
    } else {
      alert(`Failed to save: ${result.error}`);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openAddPersonModal()}
              className="btn-primary text-sm"
            >
              + Add Person
            </button>
            
            <div className="h-6 w-px bg-[var(--color-border)] mx-2" />
            
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
              title="Undo"
            >
              <span className="hidden sm:inline">↶ Undo</span>
              <span className="sm:hidden">↶</span>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
              title="Redo"
            >
              <span className="hidden sm:inline">↷ Redo</span>
              <span className="sm:hidden">↷</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {!isAuthenticated && (
              <button
                onClick={handleSaveToCloud}
                className="btn-secondary text-sm"
                title="Save to cloud"
              >
                💾 Save to Cloud
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={handleSaveToCloud}
                disabled={isSyncing}
                className="btn-secondary text-sm disabled:opacity-50"
                title="Sync to cloud"
              >
                {isSyncing ? 'Syncing...' : '☁️ Sync'}
              </button>
            )}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="btn-secondary text-sm"
            >
              Export
            </button>
            <Link to="/themes" className="btn-secondary text-sm">
              Themes
            </Link>
          </div>
        </div>
      </div>

      <AddPersonModal
        isOpen={addPersonModal.isOpen}
        onClose={closeAddPersonModal}
        relatedPersonId={addPersonModal.relatedPersonId}
        relationshipType={addPersonModal.relationshipType}
      />
      <EditPersonModal
        isOpen={editPersonModal.isOpen}
        onClose={closeEditPersonModal}
        personId={editPersonModal.personId}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        treeElement={treeElement}
      />
    </>
  );
}

