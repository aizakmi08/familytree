import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function DownloadSuccess() {
  const [searchParams] = useSearchParams();
  // Support both Polar (checkout_id) and legacy Stripe (session_id)
  const checkoutId = searchParams.get('checkout_id') || searchParams.get('session_id');

  const [status, setStatus] = useState('loading');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!checkoutId) {
      setStatus('error');
      setError('No payment session found');
      return;
    }

    fetch(`${API_URL}/payments/verify-session/${checkoutId}`)
      .then(res => res.json())
      .then(data => {
        if (data.paid) {
          setStatus('success');
          setDownloadUrl(data.downloadUrl);
        } else {
          setStatus('error');
          setError(data.message || 'Payment not completed');
        }
      })
      .catch(err => {
        setStatus('error');
        setError(err.message);
      });
  }, [checkoutId]);

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      const response = await fetch(downloadUrl);
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
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-6">
              <span className="spinner" style={{ width: '48px', height: '48px' }} />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Verifying Payment</h1>
            <p className="text-gray-500">Please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Success</h1>
            <p className="text-gray-500 mb-8">Your family tree is ready to download</p>

            {downloadUrl && (
              <div className="card mb-6">
                <img
                  src={downloadUrl}
                  alt="Your Family Tree"
                  className="w-full h-auto rounded-lg mb-4"
                />
                <button
                  onClick={handleDownload}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            )}

            <div className="space-y-3">
              <Link to="/builder" className="block w-full btn-secondary py-3">
                Create Another
              </Link>
              <Link to="/" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              {error || 'Could not verify payment'}
            </p>
            <div className="space-y-3">
              <Link to="/builder" className="block w-full btn-primary py-3">
                Try Again
              </Link>
              <Link to="/" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
