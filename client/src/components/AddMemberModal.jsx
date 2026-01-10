import { useState, useRef, useEffect, useCallback } from 'react';
import { useFamilyStore } from '../store/familyStore';

const RELATIONSHIP_TYPES = [
  { id: 'child', label: 'Child of', icon: '↑', allowMultiple: true },
  { id: 'parent', label: 'Parent of', icon: '↓', allowMultiple: true },
  { id: 'spouse', label: 'Spouse of', icon: '↔', allowMultiple: false },
  { id: 'sibling', label: 'Sibling of', icon: '=', allowMultiple: true },
];

// Compress image to reduce size for localStorage
const compressImage = (dataUrl, maxWidth = 200) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export default function AddMemberModal({ isOpen, onClose, editMember = null }) {
  const { members, addMember, updateMember, addRelationship, relationships } = useFamilyStore();
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const hasInitialized = useRef(false);
  const isClosing = useRef(false);
  const initialRelationships = useRef([]);

  // Form fields
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Relationship state
  const [selectedRelationType, setSelectedRelationType] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [pendingRelationships, setPendingRelationships] = useState([]);

  // Close modal - use ref to prevent multiple calls
  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;

    // Reset all state
    setName('');
    setBirthYear('');
    setDeathYear('');
    setPhotoUrl('');
    setPhotoPreview(null);
    setSelectedRelationType(null);
    setSelectedMembers([]);
    setPendingRelationships([]);
    setIsSubmitting(false);
    hasInitialized.current = false;

    // Call parent close
    onClose();

    // Reset closing flag after a delay
    setTimeout(() => {
      isClosing.current = false;
    }, 100);
  }, [onClose]);

  // Initialize form when modal opens - NO relationships in dependencies
  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;
    isClosing.current = false;

    // Capture current relationships for edit mode
    initialRelationships.current = relationships;

    if (editMember) {
      setName(editMember.name || '');
      setBirthYear(editMember.birthYear != null ? String(editMember.birthYear) : '');
      setDeathYear(editMember.deathYear != null ? String(editMember.deathYear) : '');
      setPhotoUrl(editMember.photoUrl || '');
      setPhotoPreview(editMember.photoUrl || null);

      // Load existing relationships from captured snapshot
      const existingRels = initialRelationships.current
        .filter(r => r.from === editMember.id || r.to === editMember.id)
        .map(r => ({
          type: r.type,
          memberId: r.from === editMember.id ? r.to : r.from,
          direction: r.from === editMember.id ? 'from' : 'to',
          id: r.id,
          isExisting: true,
        }));
      setPendingRelationships(existingRels);
    } else {
      setName('');
      setBirthYear('');
      setDeathYear('');
      setPhotoUrl('');
      setPhotoPreview(null);
      setPendingRelationships([]);
    }

    setSelectedRelationType(null);
    setSelectedMembers([]);
    setIsSubmitting(false);

    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [isOpen, editMember]); // Removed relationships from dependencies

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Compress image to avoid localStorage issues
        const compressed = await compressImage(reader.result);
        setPhotoPreview(compressed);
        setPhotoUrl(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = (e) => {
    e.stopPropagation();
    setPhotoPreview(null);
    setPhotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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

    // Prevent double submission
    if (isSubmitting || isClosing.current) return;

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSubmitting(true);

    try {
      // Create member data
      const memberData = {
        name: trimmedName,
        birthYear: birthYear ? parseInt(birthYear) : null,
        deathYear: deathYear ? parseInt(deathYear) : null,
        photoUrl: photoUrl || null,
      };

      let memberId;

      // Add or update member
      if (editMember) {
        updateMember(editMember.id, memberData);
        memberId = editMember.id;
      } else {
        memberId = addMember(memberData);
      }

      // Collect all new relationships
      const allNewRelationships = [...pendingRelationships.filter(rel => rel.isNew)];

      // Include any in-progress selection
      if (selectedRelationType && selectedMembers.length > 0) {
        selectedMembers.forEach(mid => {
          allNewRelationships.push({
            type: selectedRelationType,
            memberId: mid,
            isNew: true,
          });
        });
      }

      // Add all relationships to store
      allNewRelationships.forEach(rel => {
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

      // Close modal after everything is done
      handleClose();
    } catch (error) {
      console.error('Error saving member:', error);
      setIsSubmitting(false);
    }
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
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-white transition-colors p-1 disabled:opacity-50"
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
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full bg-surface-800 border border-surface-600 hover:border-surface-500 cursor-pointer flex items-center justify-center overflow-hidden transition-colors flex-shrink-0"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                {photoPreview && !isSubmitting && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input flex-1"
                placeholder="Full Name"
                autoComplete="off"
                disabled={isSubmitting}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>

            {/* Years */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Birth Year</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="input"
                  placeholder="1950"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="label">Death Year</label>
                <input
                  type="number"
                  value={deathYear}
                  onChange={(e) => setDeathYear(e.target.value)}
                  className="input"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Relationships */}
            {availableMembers.length > 0 && (
              <div className="border-t border-surface-800 pt-5">
                <label className="label">Relationships</label>

                {/* Pending Relationships */}
                {pendingRelationships.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {pendingRelationships.map((rel, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 px-3 py-1.5 rounded-lg text-sm"
                      >
                        <span>{getRelationshipLabel(rel)}</span>
                        {rel.isNew && !isSubmitting && (
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

                {/* Relationship Selector */}
                {!isSubmitting && (
                  <>
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
                          {getSelectableMembers().length === 0 ? (
                            <p className="text-sm text-gray-600 text-center py-2">No members available</p>
                          ) : (
                            getSelectableMembers().map((member) => {
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
                            })
                          )}
                        </div>

                        {selectedMembers.length > 0 && (
                          <button
                            type="button"
                            onClick={handleAddRelationships}
                            className="w-full btn-secondary py-2 text-sm"
                          >
                            Add Relationship
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-surface-800 px-6 py-4 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (editMember ? 'Save' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
