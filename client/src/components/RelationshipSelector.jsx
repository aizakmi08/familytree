import { useState } from 'react';
import { useFamilyStore } from '../store/familyStore';

const RELATIONSHIP_TYPES = [
  { id: 'parent', label: 'Parent of', icon: '👨' },
  { id: 'child', label: 'Child of', icon: '👶' },
  { id: 'spouse', label: 'Spouse of', icon: '💑' },
  { id: 'sibling', label: 'Sibling of', icon: '👫' },
];

export default function RelationshipSelector({ isOpen, onClose, fromMember }) {
  const { members, addRelationship } = useFamilyStore();
  const [selectedType, setSelectedType] = useState('parent');
  const [selectedToMember, setSelectedToMember] = useState('');

  const otherMembers = members.filter((m) => m.id !== fromMember?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedToMember || !selectedType) return;
    
    addRelationship(fromMember.id, selectedToMember, selectedType);
    
    setSelectedType('parent');
    setSelectedToMember('');
    onClose();
  };

  if (!isOpen || !fromMember) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Add Relationship</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* From Member Display */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {fromMember.photoUrl ? (
                <img src={fromMember.photoUrl} alt={fromMember.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-white">{fromMember.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{fromMember.name}</p>
              <p className="text-sm text-gray-500">Defining relationship for</p>
            </div>
          </div>

          {/* Relationship Type */}
          <div>
            <label className="label">Relationship Type</label>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-lg mr-2">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* To Member */}
          <div>
            <label className="label">Select Person</label>
            {otherMembers.length === 0 ? (
              <p className="text-gray-500 text-sm">Add more family members first</p>
            ) : (
              <select
                value={selectedToMember}
                onChange={(e) => setSelectedToMember(e.target.value)}
                className="input"
                required
              >
                <option value="">Choose a family member...</option>
                {otherMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.birthYear && ` (${member.birthYear})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Summary */}
          {selectedToMember && (
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-blue-800">
                <span className="font-semibold">{fromMember.name}</span>
                {' is '}
                <span className="font-semibold">
                  {RELATIONSHIP_TYPES.find((t) => t.id === selectedType)?.label.toLowerCase()}
                </span>
                {' '}
                <span className="font-semibold">
                  {members.find((m) => m.id === selectedToMember)?.name}
                </span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedToMember || otherMembers.length === 0}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              Add Relationship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

