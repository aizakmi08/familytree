import { useState, useRef, useEffect } from 'react';
import { useFamilyStore } from '../store/familyStore';

const RELATIONSHIP_TYPES = [
  { id: 'child', label: 'Child of', icon: '↑', allowMultiple: true },
  { id: 'parent', label: 'Parent of', icon: '↓', allowMultiple: true },
  { id: 'spouse', label: 'Spouse of', icon: '↔', allowMultiple: false },
  { id: 'sibling', label: 'Sibling of', icon: '=', allowMultiple: true },
];

export default function AddMemberModal({ isOpen, onClose, editMember = null }) {
  const { members, addMember, updateMember, addRelationship, relationships } = useFamilyStore();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    deathYear: '',
    photoUrl: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedRelationType, setSelectedRelationType] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [pendingRelationships, setPendingRelationships] = useState([]);
  const [formInitialized, setFormInitialized] = useState(false);

  // Initialize form when modal opens - only run once per open
  useEffect(() => {
    if (isOpen && !formInitialized) {
      if (editMember) {
        setFormData({
          name: editMember.name || '',
          birthYear: editMember.birthYear != null ? String(editMember.birthYear) : '',
          deathYear: editMember.deathYear != null ? String(editMember.deathYear) : '',
          photoUrl: editMember.photoUrl || '',
        });
        setPhotoPreview(editMember.photoUrl || null);

        const existingRels = relationships.filter(
          r => r.from === editMember.id || r.to === editMember.id
        ).map(r => ({
          type: r.type,
          memberId: r.from === editMember.id ? r.to : r.from,
          direction: r.from === editMember.id ? 'from' : 'to',
          id: r.id,
        }));
        setPendingRelationships(existingRels);
      } else {
        setFormData({ name: '', birthYear: '', deathYear: '', photoUrl: '' });
        setPhotoPreview(null);
        setPendingRelationships([]);
      }
      setSelectedRelationType(null);
      setSelectedMembers([]);
      setFormInitialized(true);
    }
  }, [isOpen, editMember, relationships, formInitialized]);

  // Reset form initialized flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormInitialized(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemberToggle = (memberId) => {
    const relType = RELATIONSHIP_TYPES.find(t => t.id === selectedRelationType);

    if (relType?.allowMultiple) {
      setSelectedMembers(prev =>
        prev.includes(memberId)
          ? prev.filter(id => id !== memberId)
          : [...prev, memberId]
      );
    } else {
      setSelectedMembers([memberId]);
    }
  };

  const handleAddRelationships = () => {
    if (!selectedRelationType || selectedMembers.length === 0) return;

    const newRels = selectedMembers.map(memberId => ({
      type: selectedRelationType,
      memberId,
      direction: 'from',
      isNew: true,
    }));

    setPendingRelationships(prev => [...prev, ...newRels]);
    setSelectedRelationType(null);
    setSelectedMembers([]);
  };

  const handleRemovePendingRelationship = (index) => {
    setPendingRelationships(prev => prev.filter((_, i) => i !== index));
  };

  const getMemberName = (memberId) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getRelationshipLabel = (rel) => {
    const memberName = getMemberName(rel.memberId);
    switch (rel.type) {
      case 'child': return `Child of ${memberName}`;
      case 'parent': return `Parent of ${memberName}`;
      case 'spouse': return `Spouse of ${memberName}`;
      case 'sibling': return `Sibling of ${memberName}`;
      default: return memberName;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const memberData = {
      name: formData.name.trim(),
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
      deathYear: formData.deathYear ? parseInt(formData.deathYear) : null,
      photoUrl: formData.photoUrl || null,
    };

    let memberId;

    if (editMember) {
      updateMember(editMember.id, memberData);
      memberId = editMember.id;
    } else {
      memberId = addMember(memberData);
    }

    pendingRelationships
      .filter(rel => rel.isNew)
      .forEach(rel => {
        if (rel.type === 'child') {
          addRelationship(rel.memberId, memberId, 'parent');
        } else if (rel.type === 'parent') {
          addRelationship(memberId, rel.memberId, 'parent');
        } else if (rel.type === 'spouse') {
          addRelationship(memberId, rel.memberId, 'spouse');
        } else if (rel.type === 'sibling') {
          addRelationship(memberId, rel.memberId, 'sibling');
        }
      });

    handleClose();
  };

  const handleClose = () => {
    setFormData({ name: '', birthYear: '', deathYear: '', photoUrl: '' });
    setPhotoPreview(null);
    setSelectedRelationType(null);
    setSelectedMembers([]);
    setPendingRelationships([]);
    setFormInitialized(false);
    onClose();
  };

  const availableMembers = members.filter(m => m.id !== editMember?.id);

  const getSelectableMembers = () => {
    if (!selectedRelationType) return [];
    const alreadyRelated = pendingRelationships
      .filter(r => r.type === selectedRelationType)
      .map(r => r.memberId);
    return availableMembers.filter(m => !alreadyRelated.includes(m.id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface-900 rounded-xl border border-surface-700 w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-800 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              {editMember ? 'Edit Member' : 'Add Member'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Photo & Name */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full bg-surface-800 border border-surface-600 hover:border-surface-500 cursor-pointer flex items-center justify-center overflow-hidden transition-colors flex-shrink-0"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoPreview(null);
                      setFormData((prev) => ({ ...prev, photoUrl: '' }));
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input flex-1"
                placeholder="Full Name"
                required
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Years */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Birth Year</label>
                <input
                  type="number"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="1950"
                />
              </div>
              <div>
                <label className="label">Death Year</label>
                <input
                  type="number"
                  name="deathYear"
                  value={formData.deathYear}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Relationships */}
            {availableMembers.length > 0 && (
              <div className="border-t border-surface-800 pt-5">
                <label className="label">Relationships</label>

                {/* Pending */}
                {pendingRelationships.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {pendingRelationships.map((rel, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 px-3 py-1.5 rounded-lg text-sm"
                      >
                        <span>{getRelationshipLabel(rel)}</span>
                        {rel.isNew && (
                          <button
                            type="button"
                            onClick={() => handleRemovePendingRelationship(index)}
                            className="hover:text-primary-300"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Selector */}
                {!selectedRelationType ? (
                  <div className="grid grid-cols-4 gap-2">
                    {RELATIONSHIP_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedRelationType(type.id)}
                        className="p-3 rounded-lg border border-surface-700 hover:border-surface-500 bg-surface-800 transition-all text-center"
                      >
                        <div className="text-lg text-gray-400 mb-1">{type.icon}</div>
                        <span className="text-xs text-gray-500">{type.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {RELATIONSHIP_TYPES.find(t => t.id === selectedRelationType)?.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRelationType(null);
                          setSelectedMembers([]);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getSelectableMembers().map((member) => {
                        const isSelected = selectedMembers.includes(member.id);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleMemberToggle(member.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-surface-700 hover:border-surface-600 bg-surface-800'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {member.photoUrl ? (
                                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-400 text-sm">{member.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="flex-1 text-left text-sm text-white">{member.name}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedMembers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddRelationships}
                        className="w-full btn-secondary py-2 text-sm"
                      >
                        Add
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-surface-800 px-6 py-4 flex gap-3">
            <button type="button" onClick={handleClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isUploading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {editMember ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
