import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "Preparing the canvas...",
  "Gathering family memories...",
  "Choosing the perfect brushstrokes...",
  "Adding artistic flourishes...",
  "Weaving family connections...",
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

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    // Animate progress
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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary-900/95 to-primary-800/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        {/* Animated icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto">
            <svg
              className="w-full h-full animate-pulse-slow"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
                transform="rotate(-90 50 50)"
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                fontSize="30"
                fill="white"
              >
                🌳
              </text>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Creating Your Family Tree
        </h2>

        {/* Theme indicator */}
        <p className="text-white/60 mb-6">
          Using <span className="text-white font-medium">{theme}</span> theme
        </p>

        {/* Loading message */}
        <p className="text-white/80 text-lg mb-4 h-7 transition-all duration-300">
          {LOADING_MESSAGES[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/40 text-sm">
          {Math.round(progress)}% complete
        </p>

        {/* Tip */}
        <p className="text-white/50 text-xs mt-8">
          This usually takes 15-30 seconds
        </p>
      </div>
    </div>
  );
}

