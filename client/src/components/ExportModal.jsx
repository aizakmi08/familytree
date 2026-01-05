import { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { exportAsPNG, exportAsPDF } from '../utils/export';
import { createExportCheckout } from '../utils/payments';

export default function ExportModal({ isOpen, onClose, treeElement }) {
  const { isAuthenticated, token } = useAuthStore();
  const [format, setFormat] = useState('png');
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef(null);

  const handleExport = async () => {
    if (!treeElement) {
      alert('No tree to export');
      return;
    }

    setExporting(true);

    try {
      if (format === 'pdf' && !isAuthenticated) {
        // PDF requires payment
        const result = await createExportCheckout('pdf', token);
        if (result.success) {
          window.location.href = result.url;
        } else {
          alert(`Failed to start checkout: ${result.error}`);
        }
        setExporting(false);
        return;
      }

      const filename = `family-tree-${Date.now()}`;
      const watermarked = !isAuthenticated; // Watermark for free users

      if (format === 'png') {
        await exportAsPNG(treeElement, filename, watermarked);
      } else if (format === 'pdf') {
        await exportAsPDF(treeElement, filename, false); // PDF is premium, no watermark
      }

      onClose();
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl font-semibold text-[var(--color-text-primary)]">
              Export Family Tree
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Format Selection */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                Export Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-4 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="png"
                    checked={format === 'png'}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-[var(--color-accent)]"
                  />
                  <div className="flex-1">
                    <div className="font-medium">PNG Image</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {isAuthenticated ? 'High-quality, unwatermarked' : 'Free (watermarked)'}
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-accent)] transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={format === 'pdf'}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-[var(--color-accent)]"
                  />
                  <div className="flex-1">
                    <div className="font-medium flex items-center space-x-2">
                      <span>PDF Document</span>
                      {!isAuthenticated && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {isAuthenticated ? 'Print-ready PDF' : '$2.99 one-time purchase'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : format === 'pdf' && !isAuthenticated ? 'Purchase & Export' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

