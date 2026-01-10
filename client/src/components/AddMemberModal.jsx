import { useState, useRef, useEffect } from 'react';
import { useFamilyStore } from '../store/familyStore';

export default function AddMemberModal({ isOpen, onClose, editMember = null }) {
  const { members, addMember, updateMember, addRelationship, relationships, deleteRelationship } = useFamilyStore();
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  // Form state
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  // Relationship state - simple dropdown approach
  const [relationType, setRelationType] = useState('');
  const [relatedMemberId, setRelatedMemberId] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get existing relationships for this member (when editing)
  const existingRelationships = editMember
    ? relationships.filter(r => r.from === editMember.id || r.to === editMember.id)
    : [];

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editMember) {
        setName(editMember.name || '');
        setBirthYear(editMember.birthYear != null ? String(editMember.birthYear) : '');
        setDeathYear(editMember.deathYear != null ? String(editMember.deathYear) : '');
        setPhotoUrl(editMember.photoUrl || '');
        setPhotoPreview(editMember.photoUrl || null);
      } else {
        resetForm();
      }
      setError('');
      // Focus name input after a short delay
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, editMember]);

  const resetForm = () => {
    setName('');
    setBirthYear('');
    setDeathYear('');
    setPhotoUrl('');
    setPhotoPreview(null);
    setRelationType('');
    setRelatedMemberId('');
    setError('');
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setPhotoUrl(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    setPhotoPreview(null);
    setPhotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a name');
      nameInputRef.current?.focus();
      return;
    }

    if (birthYear && deathYear && parseInt(deathYear) < parseInt(birthYear)) {
      setError('Death year cannot be before birth year');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const memberData = {
        name: trimmedName,
        birthYear: birthYear ? parseInt(birthYear) : null,
        deathYear: deathYear ? parseInt(deathYear) : null,
        photoUrl: photoUrl || null,
      };

      let memberId;

      if (editMember) {
        updateMember(editMember.id, memberData);
        memberId = editMember.id;
      } else {
        memberId = addMember(memberData);
      }

      // Add relationship if selected (for new members)
      if (!editMember && relationType && relatedMemberId) {
        if (relationType === 'child') {
          // "New member is child of X" -> X is parent of new member
          addRelationship(relatedMemberId, memberId, 'parent');
        } else if (relationType === 'parent') {
          // "New member is parent of X" -> new member is parent of X
          addRelationship(memberId, relatedMemberId, 'parent');
        } else {
          addRelationship(memberId, relatedMemberId, relationType);
        }
      }

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 150));

      handleClose();
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDeleteRelationship = (relId) => {
    deleteRelationship(relId);
  };

  const getRelationshipDisplay = (rel) => {
    const otherMemberId = rel.from === editMember?.id ? rel.to : rel.from;
    const otherMember = members.find(m => m.id === otherMemberId);
    if (!otherMember) return null;

    const isFrom = rel.from === editMember?.id;

    if (rel.type === 'parent') {
      return isFrom
        ? `Parent of ${otherMember.name}`
        : `Child of ${otherMember.name}`;
    } else if (rel.type === 'spouse') {
      return `Spouse of ${otherMember.name}`;
    } else if (rel.type === 'sibling') {
      return `Sibling of ${otherMember.name}`;
    }
    return `Related to ${otherMember.name}`;
  };

  // Available members for relationship (exclude self)
  const availableMembers = members.filter(m => m.id !== editMember?.id);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-surface-900 rounded-2xl border border-surface-700 w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {editMember ? 'Edit Member' : 'Add Family Member'}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 -mr-2 text-gray-500 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full bg-surface-800 border-2 border-dashed border-surface-600 hover:border-primary-500 cursor-pointer flex items-center justify-center overflow-hidden transition-all group"
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs">Change</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-500">Add Photo</span>
                  </div>
                )}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-600 mt-2">Optional - helps with recognition</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full text-base"
                placeholder="e.g. John Smith"
                autoComplete="off"
              />
            </div>

            {/* Years */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Birth Year</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="input w-full"
                  placeholder="1950"
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Death Year</label>
                <input
                  type="number"
                  value={deathYear}
                  onChange={(e) => setDeathYear(e.target.value)}
                  className="input w-full"
                  placeholder="Optional"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            {/* Relationship - Only show for new members when there are existing members */}
            {!editMember && availableMembers.length > 0 && (
              <div className="border-t border-surface-800 pt-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Relationship <span className="text-gray-600">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={relationType}
                    onChange={(e) => {
                      setRelationType(e.target.value);
                      if (!e.target.value) setRelatedMemberId('');
                    }}
                    className="input"
                  >
                    <option value="">Select type...</option>
                    <option value="child">Child of</option>
                    <option value="parent">Parent of</option>
                    <option value="spouse">Spouse of</option>
                    <option value="sibling">Sibling of</option>
                  </select>
                  <select
                    value={relatedMemberId}
                    onChange={(e) => setRelatedMemberId(e.target.value)}
                    className="input"
                    disabled={!relationType}
                  >
                    <option value="">Select person...</option>
                    {availableMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                {relationType && relatedMemberId && (
                  <p className="text-sm text-primary-400 mt-2">
                    {name || 'This person'} is {relationType === 'child' ? 'child of' : relationType === 'parent' ? 'parent of' : relationType + ' of'} {members.find(m => m.id === relatedMemberId)?.name}
                  </p>
                )}
              </div>
            )}

            {/* Existing Relationships - Only show when editing */}
            {editMember && existingRelationships.length > 0 && (
              <div className="border-t border-surface-800 pt-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Current Relationships
                </label>
                <div className="space-y-2">
                  {existingRelationships.map(rel => {
                    const display = getRelationshipDisplay(rel);
                    if (!display) return null;
                    return (
                      <div
                        key={rel.id}
                        className="flex items-center justify-between bg-surface-800 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm text-gray-300">{display}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRelationship(rel.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          title="Remove relationship"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-surface-800 px-6 py-4 bg-surface-900/50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 btn-secondary py-3"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSaving}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  editMember ? 'Save Changes' : 'Add Member'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
