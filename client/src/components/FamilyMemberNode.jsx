import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useTreeStore } from '../store/treeStore';

export default function FamilyMemberNode({ id, data }) {
  const { setSelectedPerson, selectedPerson } = useTreeStore();
  const isSelected = selectedPerson === id;

  const handleClick = useCallback(() => {
    setSelectedPerson(id);
  }, [id, setSelectedPerson]);

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-2 transition-all duration-200 cursor-pointer min-w-[180px] ${
        isSelected
          ? 'border-[var(--color-accent)] shadow-lg scale-105'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:shadow-lg'
      }`}
      onClick={handleClick}
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
    </div>
  );
}

