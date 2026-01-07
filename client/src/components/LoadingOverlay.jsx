import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "Preparing canvas...",
  "Gathering memories...",
  "Adding details...",
  "Weaving connections...",
  "Almost there...",
  "Finishing touches...",
];

export default function LoadingOverlay({ isVisible, theme }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      setProgress(0);
      return;
    }

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-surface-950/98 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center max-w-sm px-8">
        {/* Progress ring */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                strokeLinecap="round"
                className="text-primary-400 transition-all duration-500"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-1">
          Generating
        </h2>

        {/* Theme */}
        <p className="text-gray-500 text-sm mb-4">
          {theme} theme
        </p>

        {/* Message */}
        <p className="text-gray-400 text-sm h-5">
          {LOADING_MESSAGES[messageIndex]}
        </p>

        {/* Time note */}
        <p className="text-gray-600 text-xs mt-6">
          ~30 seconds
        </p>
      </div>
    </div>
  );
}
