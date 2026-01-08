import { useState, useEffect, useRef } from 'react';
import PaymentModal from './PaymentModal';

export default function GenerationResult({ imageUrl, imageId, onClose, onRegenerate, isPaid = false }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(isPaid);
  const [paidDownloadUrl, setPaidDownloadUrl] = useState(null);
  const [screenshotWarning, setScreenshotWarning] = useState(false);
  const imageContainerRef = useRef(null);

  // Prevent right-click, screenshots, and other capture methods
  useEffect(() => {
    if (hasPaid) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      setScreenshotWarning(true);
      setTimeout(() => setScreenshotWarning(false), 2000);
      return false;
    };

    const handleKeyDown = (e) => {
      // Prevent PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setScreenshotWarning(true);
        setTimeout(() => setScreenshotWarning(false), 2000);
        return false;
      }
      // Prevent Ctrl+S, Ctrl+P, Ctrl+Shift+S, Ctrl+C
      if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'S' || e.key === 'c')) {
        e.preventDefault();
        setScreenshotWarning(true);
        setTimeout(() => setScreenshotWarning(false), 2000);
        return false;
      }
    };

    // Prevent drag
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent selection
    const handleSelectStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Detect visibility change (possible screenshot)
    const handleVisibilityChange = () => {
      if (document.hidden && !hasPaid) {
        // User switched tabs - could be screenshotting
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasPaid]);

  const handleDownload = async () => {
    if (!hasPaid || !paidDownloadUrl) {
      setShowPaymentModal(true);
      return;
    }

    try {
      const response = await fetch(paidDownloadUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `family-tree-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(paidDownloadUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (!hasPaid || !paidDownloadUrl) {
      setShowPaymentModal(true);
      return;
    }
    // Share functionality for paid users
    navigator.clipboard.writeText(paidDownloadUrl);
    alert('Link copied to clipboard!');
  };

  const handlePaymentSuccess = (downloadUrl) => {
    setHasPaid(true);
    setPaidDownloadUrl(downloadUrl);
    setShowPaymentModal(false);
    // Trigger download after payment success
    if (downloadUrl) {
      setTimeout(() => {
        // Download the clean image
        fetch(downloadUrl)
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `family-tree-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Download failed:', error);
            window.open(downloadUrl, '_blank');
          });
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface-950 flex items-center justify-center p-4 overflow-y-auto no-select">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 rounded-lg hover:bg-surface-800 transition-colors z-20"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main content */}
      <div className="max-w-3xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Your Family Tree</h2>
          <p className="text-gray-500 text-sm">
            {hasPaid ? 'Ready to download' : 'Preview - Download to get full quality'}
          </p>
        </div>

        {/* Screenshot warning toast */}
        {screenshotWarning && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">Preview is protected. Purchase to download!</span>
          </div>
        )}

        {/* Image container with protection */}
        <div
          ref={imageContainerRef}
          className="relative rounded-xl overflow-hidden bg-surface-900 border border-surface-800 image-protection-container"
        >
          {/* The actual image with watermark from server */}
          <div className={`relative ${!hasPaid ? 'select-none pointer-events-none' : ''}`}>
            <img
              src={imageUrl}
              alt="Your Family Tree"
              className="w-full h-auto protected-image"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
            />

            {/* Additional CSS protection overlays for unpaid */}
            {!hasPaid && (
              <>
                {/* Invisible protective overlay that blocks interactions */}
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background: 'transparent',
                    cursor: 'not-allowed',
                  }}
                  onClick={() => setShowPaymentModal(true)}
                />

                {/* Subtle corner badges */}
                <div className="absolute top-3 left-3 bg-surface-950/80 text-xs text-gray-400 px-2 py-1 rounded">
                  PREVIEW
                </div>
                <div className="absolute top-3 right-3 bg-surface-950/80 text-xs text-gray-400 px-2 py-1 rounded">
                  Heritage.ai
                </div>
                <div className="absolute bottom-3 left-3 bg-surface-950/80 text-xs text-gray-400 px-2 py-1 rounded">
                  $2.99 to unlock
                </div>
                <div className="absolute bottom-3 right-3 bg-surface-950/80 text-xs text-gray-400 px-2 py-1 rounded">
                  PREVIEW
                </div>

                {/* Center unlock prompt */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div
                    className="bg-surface-950/95 backdrop-blur-sm rounded-xl p-6 text-center max-w-xs border border-surface-700 shadow-2xl pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium mb-2">Unlock Full Quality</p>
                    <p className="text-gray-400 text-sm mb-4">HD download without watermarks</p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="btn-primary w-full text-sm"
                    >
                      Download HD - $2.99
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {hasPaid ? 'Download' : 'Download HD'}
          </button>

          <button
            onClick={handleShare}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          <button
            onClick={onRegenerate}
            className="btn-ghost flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>

        {/* Paid confirmation */}
        {hasPaid && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 px-4 py-2 rounded-full text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Unlocked</span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        imageUrl={imageUrl}
        imageId={imageId}
      />
    </div>
  );
}
