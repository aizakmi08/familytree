import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Purchases() {
  const [email, setEmail] = useState('');
  const [purchases, setPurchases] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/payments/purchases/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        setPurchases(data.purchases);
      } else {
        setError(data.error || 'Failed to retrieve purchases');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadUrl) => {
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
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="glass border-b border-surface-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-surface-950" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
              </div>
              <span className="font-serif text-lg font-semibold text-white">Heritage</span>
            </Link>
            <Link to="/builder" className="btn-primary text-sm py-2">
              Create
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">My Purchases</h1>
          <p className="text-gray-500">Enter your email to access your purchased family trees</p>
        </div>

        {/* Email Lookup Form */}
        <form onSubmit={handleLookup} className="card mb-8">
          <div className="mb-4">
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Looking up...
              </span>
            ) : (
              'Find My Purchases'
            )}
          </button>
        </form>

        {/* Results */}
        {purchases !== null && (
          <div>
            {purchases.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">No purchases found</h2>
                <p className="text-gray-500 mb-6">No purchases were found for this email address.</p>
                <Link to="/builder" className="btn-primary">
                  Create a Family Tree
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {purchases.length} Purchase{purchases.length !== 1 ? 's' : ''} Found
                </h2>
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="card flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
                        <img
                          src={purchase.downloadUrl}
                          alt="Family Tree"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">Family Tree</p>
                        <p className="text-gray-500 text-sm">
                          Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(purchase.downloadUrl)}
                      className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
