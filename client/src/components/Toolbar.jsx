import AddPersonModal from './AddPersonModal';
import EditPersonModal from './EditPersonModal';
import { useTreeStore } from '../store/treeStore';
import { useModal } from '../contexts/ModalContext';

export default function Toolbar() {
  const { undo, redo, history, historyIndex } = useTreeStore();
  const {
    addPersonModal,
    openAddPersonModal,
    closeAddPersonModal,
    editPersonModal,
    closeEditPersonModal,
  } = useModal();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
              title="Undo"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
              title="Redo"
            >
              ↷ Redo
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="btn-secondary text-sm">Export</button>
            <button className="btn-secondary text-sm">Themes</button>
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
    </>
  );
}

