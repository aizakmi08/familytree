import { useState } from 'react';
import { useTreeStore } from '../store/treeStore';
import { useModal } from '../contexts/ModalContext';

const RELATIONSHIP_TYPES = [
  { value: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
  { value: 'child', label: 'Child', icon: '👶' },
  { value: 'spouse', label: 'Spouse', icon: '💑' },
  { value: 'sibling', label: 'Sibling', icon: '👫' },
];

export default function RelationshipSelector({ fromPersonId, onClose }) {
  const { tree, addRelationship } = useTreeStore();
  const { openAddPersonModal } = useModal();
  const [selectedType, setSelectedType] = useState(null);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setShowAddNew(true);
  };

  const handleConnectExisting = (toPersonId) => {
    if (fromPersonId && toPersonId && selectedType) {
      addRelationship(fromPersonId, toPersonId, selectedType);
      onSelect && onSelect();
      onClose();
    }
  };

  const handleAddNew = () => {
    openAddPersonModal(fromPersonId, selectedType);
    onClose();
  };

  const existingPeople = tree.people.filter((p) => p.id !== fromPersonId);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[var(--color-border)] p-4 min-w-[280px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif font-semibold text-lg">Add Relationship</h3>
        <button
          onClick={onClose}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ×
        </button>
      </div>

      {!selectedType ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            How is this person related?
          </p>
          {RELATIONSHIP_TYPES.map((rel) => (
            <button
              key={rel.value}
              onClick={() => handleSelectType(rel.value)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all text-left"
            >
              <span className="text-2xl">{rel.icon}</span>
              <span className="font-medium text-[var(--color-text-primary)]">{rel.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <button
              onClick={() => {
                setSelectedType(null);
                setShowAddNew(false);
              }}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              ← Back
            </button>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {RELATIONSHIP_TYPES.find((r) => r.value === selectedType)?.label}
            </span>
          </div>

          {/* Add New Person */}
          <button
            onClick={handleAddNew}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all font-medium"
          >
            + Add New Person
          </button>

          {/* Connect to Existing */}
          {existingPeople.length > 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[var(--color-text-secondary)]">or connect to</span>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {existingPeople.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => handleConnectExisting(person.id)}
                    className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all text-left"
                  >
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                        <span className="text-sm text-[var(--color-accent)]">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">
                      {person.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

