import { useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useTreeStore } from '../store/treeStore';
import RelationshipSelector from './RelationshipSelector';
import { useModal } from '../contexts/ModalContext';

export default function FamilyMemberNode({ id, data, xPos, yPos }) {
  const { setSelectedPerson, selectedPerson } = useTreeStore();
  const { openEditPersonModal } = useModal();
  const [showRelationshipSelector, setShowRelationshipSelector] = useState(false);
  const isSelected = selectedPerson === id;

  const handleClick = useCallback(() => {
    setSelectedPerson(id);
  }, [id, setSelectedPerson]);

  const handleDoubleClick = useCallback(() => {
    openEditPersonModal(id);
  }, [id, openEditPersonModal]);

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-2 transition-all duration-200 cursor-pointer min-w-[180px] ${
        isSelected
          ? 'border-[var(--color-accent)] shadow-lg scale-105'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:shadow-lg'
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Photo */}
      <div className="w-full h-32 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 rounded-t-xl flex items-center justify-center overflow-hidden">
        {data.photo ? (
          <img
            src={data.photo}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
            <span className="text-2xl text-[var(--color-accent)]">
              {data.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-serif font-semibold text-sm text-[var(--color-text-primary)] truncate">
          {data.name}
        </h3>
        {data.birthDate && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {new Date(data.birthDate).getFullYear()}
            {data.deathDate && ` - ${new Date(data.deathDate).getFullYear()}`}
          </p>
        )}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />

      {/* Relationship button (shown when selected) */}
      {isSelected && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRelationshipSelector(!showRelationshipSelector);
            }}
            className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:opacity-90 transition-opacity"
          >
            + Add Relationship
          </button>
          {showRelationshipSelector && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
              <RelationshipSelector
                fromPersonId={id}
                onClose={() => setShowRelationshipSelector(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

