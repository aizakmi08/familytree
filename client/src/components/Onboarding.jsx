import { useState, useEffect } from 'react';
import { useTreeStore } from '../store/treeStore';
import { storage } from '../utils/storage';

const STEPS = [
  {
    title: 'Welcome to FamilyTree Builder!',
    content: 'Create beautiful family trees with ease. Let\'s get started!',
    position: 'center',
  },
  {
    title: 'Add Your First Family Member',
    content: 'Click the "+ Add Person" button to add family members. You can add photos, dates, and more!',
    position: 'top',
    target: 'add-person-button',
  },
  {
    title: 'Connect Relationships',
    content: 'Click on a person and select "Add Relationship" to connect family members.',
    position: 'center',
  },
  {
    title: 'Customize Your Tree',
    content: 'Visit the Themes page to choose from free and premium themes to personalize your tree.',
    position: 'center',
  },
  {
    title: 'Export Your Tree',
    content: 'Export your family tree as PNG (free) or PDF (premium) to share with family.',
    position: 'center',
  },
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    onComplete && onComplete();
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" />

      {/* Tooltip */}
      <div
        className={`absolute bg-white rounded-xl shadow-2xl p-6 max-w-sm pointer-events-auto ${
          step.position === 'top' ? 'top-20 left-1/2 transform -translate-x-1/2' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        }`}
      >
        <div className="mb-4">
          <h3 className="font-serif text-xl font-semibold mb-2">{step.title}</h3>
          <p className="text-[var(--color-text-secondary)] text-sm">{step.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Skip
          </button>
          <div className="flex items-center space-x-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                }`}
              />
            ))}
          </div>
          <button onClick={handleNext} className="btn-primary text-sm px-4 py-2">
            {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

