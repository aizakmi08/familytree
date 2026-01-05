import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { getFreeThemes, getPremiumThemes, getTheme } from '../themes/themes';
import { createThemeCheckout, getUserPurchases } from '../utils/payments';

export default function Themes() {
  const { currentTheme, changeTheme } = useTheme();
  const { isAuthenticated, token } = useAuthStore();
  const [purchasedThemes, setPurchasedThemes] = useState([]);
  const freeThemes = getFreeThemes();
  const premiumThemes = getPremiumThemes();

  useEffect(() => {
    if (isAuthenticated && token) {
      loadPurchases();
    }
  }, [isAuthenticated, token]);

  const loadPurchases = async () => {
    const result = await getUserPurchases(token);
    if (result.success) {
      setPurchasedThemes(result.purchasedThemes);
    }
  };

  const handleThemeSelect = async (themeId) => {
    const theme = getTheme(themeId);
    if (theme.category === 'free') {
      changeTheme(themeId);
    } else {
      // Premium theme
      if (!isAuthenticated) {
        alert('Please sign in to purchase premium themes.');
        return;
      }

      if (purchasedThemes.includes(themeId)) {
        // Already purchased
        changeTheme(themeId);
        return;
      }

      // Purchase theme
      const result = await createThemeCheckout(themeId, token);
      if (result.success) {
        window.location.href = result.url;
      } else {
        alert(`Failed to start checkout: ${result.error}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-4">Choose a Theme</h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Personalize your family tree with beautiful themes. Free themes are available instantly,
          while premium themes unlock unique designs inspired by popular shows and movies.
        </p>
      </div>

      {/* Free Themes */}
      <div className="mb-12">
        <h2 className="font-serif text-2xl font-semibold mb-6">Free Themes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {freeThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme.id === theme.id}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>
      </div>

      {/* Premium Themes */}
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-6">Premium Themes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme.id === theme.id}
              onSelect={handleThemeSelect}
              isPremium={true}
              isPurchased={purchasedThemes.includes(theme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ theme, isActive, onSelect, isPremium = false, isPurchased = false }) {
  return (
    <div
      className={`card cursor-pointer transition-all duration-200 hover:scale-105 relative overflow-hidden ${
        isActive ? 'ring-2 ring-[var(--color-accent)]' : ''
      }`}
      onClick={() => onSelect(theme.id)}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          PREMIUM
        </div>
      )}

      {/* Lock Overlay for Premium */}
      {isPremium && !isActive && !isPurchased && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto text-white mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-white font-semibold mb-1">Locked</p>
            <p className="text-white/80 text-sm">${theme.price}</p>
          </div>
        </div>
      )}

      {/* Theme Preview */}
      <div
        className="h-32 rounded-lg mb-4 relative"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.bgPrimary} 0%, ${theme.colors.bgSecondary} 100%)`,
        }}
      >
        {/* Sample nodes */}
        <div className="absolute inset-0 flex items-center justify-center space-x-2">
          <div
            className="w-12 h-12 rounded-lg border-2 shadow-md"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.accent,
            }}
          />
          <div
            className="w-12 h-12 rounded-lg border-2 shadow-md"
            style={{
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.accent,
            }}
          />
        </div>
      </div>

      {/* Theme Info */}
      <div>
        <h3 className="font-serif font-semibold text-lg mb-1">{theme.name}</h3>
        {isPremium && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            ${theme.price} one-time purchase
          </p>
        )}
        {isActive && (
          <span className="inline-block px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full text-sm font-medium">
            Active
          </span>
        )}
        {!isPremium && !isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(theme.id);
            }}
            className="mt-2 btn-primary text-sm w-full"
          >
            Apply Theme
          </button>
        )}
        {isPremium && !isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(theme.id);
            }}
            className="mt-2 btn-secondary text-sm w-full"
          >
            Unlock for ${theme.price}
          </button>
        )}
      </div>
    </div>
  );
}
