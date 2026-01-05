import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUserPurchases } from '../utils/payments';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, isAuthenticated } = useAuthStore();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (isAuthenticated && token && sessionId) {
      // Refresh purchases to unlock themes
      getUserPurchases(token).then(() => {
        setTimeout(() => {
          navigate('/themes');
        }, 2000);
      });
    }
  }, [isAuthenticated, token, sessionId, navigate]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="card">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Thank you for your purchase. Your premium content is now unlocked.
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Redirecting to themes...
        </p>
      </div>
    </div>
  );
}

