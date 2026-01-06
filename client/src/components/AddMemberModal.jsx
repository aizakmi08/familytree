import { useState, useRef } from 'react';
import { useFamilyStore } from '../store/familyStore';

export default function AddMemberModal({ isOpen, onClose, editMember = null }) {
  const { addMember, updateMember } = useFamilyStore();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: editMember?.name || '',
    birthYear: editMember?.birthYear || '',
    deathYear: editMember?.deathYear || '',
    photoUrl: editMember?.photoUrl || '',
  });
  const [photoPreview, setPhotoPreview] = useState(editMember?.photoUrl || null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    const memberData = {
      name: formData.name.trim(),
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
      deathYear: formData.deathYear ? parseInt(formData.deathYear) : null,
      photoUrl: formData.photoUrl || null,
    };

    if (editMember) {
      updateMember(editMember.id, memberData);
    } else {
      addMember(memberData);
    }
    
    // Reset form
    setFormData({ name: '', birthYear: '', deathYear: '', photoUrl: '' });
    setPhotoPreview(null);
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: '', birthYear: '', deathYear: '', photoUrl: '' });
    setPhotoPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {editMember ? 'Edit Family Member' : 'Add Family Member'}
            </h2>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo Upload */}
          <div>
            <label className="label">Photo (Optional)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer mx-auto flex items-center justify-center overflow-hidden transition-colors"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
              {photoPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoPreview(null);
                    setFormData((prev) => ({ ...prev, photoUrl: '' }));
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
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
            <p className="text-center text-xs text-gray-500 mt-2">Click to upload</p>
          </div>

          {/* Name */}
          <div>
            <label className="label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input"
              placeholder="e.g., John Smith"
              required
            />
          </div>

          {/* Birth Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Birth Year</label>
              <input
                type="number"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., 1950"
                min="1800"
                max={new Date().getFullYear()}
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
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isUploading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : editMember ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

