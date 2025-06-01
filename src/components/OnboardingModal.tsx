import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import type { UserProfile, OnboardingStep } from '../types';
import { ONBOARDING_STEPS } from '../config';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    interests: [],
    hobbies: []
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStep = ONBOARDING_STEPS[step];

  const handleNext = () => {
    if (currentStep.required && !profile[currentStep.field]) {
      setError('Bu alan zorunludur');
      return;
    }
    
    if (step === ONBOARDING_STEPS.length - 1) {
      onComplete({
        ...profile as UserProfile,
        lastUpdated: Date.now()
      });
    } else {
      setStep(step + 1);
      setError(null);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfile({ ...profile, photoURL: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleTagInput = (field: 'interests' | 'hobbies', value: string) => {
    if (value.endsWith(',') || value.endsWith(' ')) {
      const tag = value.slice(0, -1).trim();
      if (tag && !profile[field]?.includes(tag)) {
        setProfile({
          ...profile,
          [field]: [...(profile[field] || []), tag]
        });
      }
      return '';
    }
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentStep.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {currentStep.description}
              </p>
            </div>
            {step === 0 && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {currentStep.type === 'text' && (
              <input
                type="text"
                value={profile[currentStep.field] || ''}
                onChange={(e) => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                placeholder={currentStep.placeholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            )}

            {currentStep.type === 'date' && (
              <input
                type="date"
                value={profile[currentStep.field] || ''}
                onChange={(e) => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            )}

            {currentStep.type === 'tags' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {profile[currentStep.field]?.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => setProfile({
                          ...profile,
                          [currentStep.field]: profile[currentStep.field]?.filter((_, i) => i !== index)
                        })}
                        className="hover:text-blue-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={`${currentStep.placeholder} (Virgülle ayırın)`}
                  onChange={(e) => {
                    const newValue = handleTagInput(currentStep.field as 'interests' | 'hobbies', e.target.value);
                    if (newValue !== undefined) {
                      e.target.value = newValue;
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {currentStep.type === 'textarea' && (
              <textarea
                value={profile[currentStep.field] || ''}
                onChange={(e) => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                placeholder={currentStep.placeholder}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            )}

            {currentStep.type === 'photo' && (
              <div className="space-y-4">
                {profile.photoURL ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={profile.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <button
                      onClick={() => setProfile({ ...profile, photoURL: undefined })}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-32 h-32 mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-gray-400" />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Geri</span>
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span>{step === ONBOARDING_STEPS.length - 1 ? 'Tamamla' : 'Devam'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}