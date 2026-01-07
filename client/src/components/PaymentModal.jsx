import { useState } from 'react';
import { DOWNLOAD_PRICE } from '../themes/themes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PaymentModal({ isOpen, onClose, onSuccess, imageUrl, cleanUrl }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          imageUrl,
          cleanUrl: cleanUrl || imageUrl,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        onSuccess(data.downloadUrl || cleanUrl || imageUrl);
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-900 rounded-2xl max-w-md w-full overflow-hidden relative animate-fade-in border border-surface-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-surface-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Download Your Tree</h2>
              <p className="text-gray-500 text-sm">HD quality, no watermarks</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-white">${DOWNLOAD_PRICE}</span>
            <span className="text-gray-500 text-sm">one-time</span>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {['HD 2K Resolution', 'No Watermarks', 'Print Ready', 'Instant Delivery'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-primary-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Email input */}
          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Payment button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full btn-primary py-4 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Processing...
              </span>
            ) : (
              'Get Download'
            )}
          </button>

          {/* Security note */}
          <p className="text-center text-xs text-gray-600 mt-4 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment via Stripe
          </p>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-400 mt-3 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
