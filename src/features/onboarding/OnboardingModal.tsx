import React, { useState } from 'react';
import { Stepper } from '../../components/Stepper';
import ReflectiveCard from '../../components/ReflectiveCard';
import './OnboardingModal.css';

export interface OnboardingData {
  name: string;
  avatarUrl: string;
  tagline: string;
  campus: string;
  degreeBranch: string;
  semester: number;
  registrationNumber: string;
  interests: string[];
}

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
];

const AVAILABLE_INTERESTS = [
  'Hackathons & Coding',
  'AI & Machine Learning',
  'Robotics & IoT',
  'UI/UX Design',
  'Web3 & Crypto',
  'Cybersecurity',
  'Startups & Pitching',
  'Competitive Gaming',
  'Cultural & Arts Fest',
  'Tech Talks & Keynotes',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    name: initialData?.name || 'Suraj Naik',
    avatarUrl: initialData?.avatarUrl || AVATAR_PRESETS[0],
    tagline: initialData?.tagline || 'Undergraduate Developer & Tech Explorer',
    campus: initialData?.campus || 'Central Technological University (CTU)',
    degreeBranch: initialData?.degreeBranch || 'Computer Science & Engineering',
    semester: initialData?.semester || 6,
    registrationNumber: initialData?.registrationNumber || 'CTU-2026-0814',
    interests: initialData?.interests || ['Hackathons & Coding', 'UI/UX Design'],
  });

  if (!isOpen) return null;

  const steps = [
    { title: 'Profile', description: 'Avatar & Name' },
    { title: 'Academics', description: 'Campus & Reg No' },
    { title: 'Interests', description: 'Events You Like' },
    { title: 'ID Pass', description: 'Official Credential' },
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete(formData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="onboarding-card">
        <button
          type="button"
          className="onboarding-card__close"
          onClick={onClose}
          aria-label="Close onboarding modal"
        >
          ×
        </button>

        <div className="onboarding-card__stepper-wrapper">
          <Stepper
            steps={steps}
            activeStep={currentStep}
            onStepChange={(idx) => setCurrentStep(idx)}
            framed
          />
        </div>

        <div className="onboarding-card__step-body">
          {/* STEP 1: Profile */}
          {currentStep === 0 && (
            <div>
              <div className="onboarding-step__header">
                <h2 id="onboarding-title" className="onboarding-step__title">
                  Welcome to EventMesh! Let's set up your profile.
                </h2>
                <p className="onboarding-step__desc">
                  This identity will be displayed across events, passes, and campus hackathons.
                </p>
              </div>

              <div className="onboarding-form">
                <div className="onboarding-form__group">
                  <label className="onboarding-form__label">Choose an Avatar</label>
                  <div className="onboarding-avatars">
                    {AVATAR_PRESETS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`onboarding-avatar-btn ${
                          formData.avatarUrl === url ? 'onboarding-avatar-btn--selected' : ''
                        }`}
                        onClick={() => setFormData({ ...formData, avatarUrl: url })}
                      >
                        <img src={url} alt={`Avatar option ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="onboarding-form__group">
                  <label className="onboarding-form__label" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="onboarding-form__input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Chen"
                  />
                </div>

                <div className="onboarding-form__group">
                  <label className="onboarding-form__label" htmlFor="tagline">
                    Tagline / One-line Bio
                  </label>
                  <input
                    id="tagline"
                    type="text"
                    className="onboarding-form__input"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Open-source enthusiast & Hackathon competitor"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Academics */}
          {currentStep === 1 && (
            <div>
              <div className="onboarding-step__header">
                <h2 className="onboarding-step__title">Academic Verification</h2>
                <p className="onboarding-step__desc">
                  Required to generate your collegiate pass and grant access to university labs.
                </p>
              </div>

              <div className="onboarding-form">
                <div className="onboarding-form__group">
                  <label className="onboarding-form__label" htmlFor="campus">
                    University / College Institution
                  </label>
                  <input
                    id="campus"
                    type="text"
                    className="onboarding-form__input"
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  />
                </div>

                <div className="onboarding-form__row onboarding-form__row--2">
                  <div className="onboarding-form__group">
                    <label className="onboarding-form__label" htmlFor="degreeBranch">
                      Department / Program
                    </label>
                    <input
                      id="degreeBranch"
                      type="text"
                      className="onboarding-form__input"
                      value={formData.degreeBranch}
                      onChange={(e) => setFormData({ ...formData, degreeBranch: e.target.value })}
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div className="onboarding-form__group">
                    <label className="onboarding-form__label" htmlFor="semester">
                      Semester
                    </label>
                    <select
                      id="semester"
                      className="onboarding-form__select"
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: Number(e.target.value) })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="onboarding-form__group">
                  <label className="onboarding-form__label" htmlFor="regNo">
                    Student Registration Number / Roll No.
                  </label>
                  <input
                    id="regNo"
                    type="text"
                    className="onboarding-form__input"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationNumber: e.target.value })
                    }
                    placeholder="e.g. CTU-2026-0814"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Interests */}
          {currentStep === 2 && (
            <div>
              <div className="onboarding-step__header">
                <h2 className="onboarding-step__title">Campus Passions & Preferences</h2>
                <p className="onboarding-step__desc">
                  Pick at least 2 topics so EventMesh can tailor relevant workshops and team
                  invites.
                </p>
              </div>

              <div className="onboarding-tags">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const selected = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`onboarding-tag-btn ${
                        selected ? 'onboarding-tag-btn--selected' : ''
                      }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {selected ? '✓ ' : '+ '} {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Official ID Pass Generation */}
          {currentStep === 3 && (
            <div>
              <div className="onboarding-step__header" style={{ textAlign: 'center' }}>
                <h2 className="onboarding-step__title">Your Metallic Pass is Ready!</h2>
                <p className="onboarding-step__desc">
                  Move your cursor or touch your card below to inspect the light reflection.
                </p>
              </div>

              <div className="onboarding-pass-preview">
                <ReflectiveCard
                  name={formData.name}
                  role={`${formData.degreeBranch} · Sem ${formData.semester}`}
                  badge="EVENTMESH PASSHOLDER"
                  status="AUTHENTICATED"
                  statusColor="#10b981"
                  idLabel="STUDENT ID"
                  idValue={formData.registrationNumber}
                  width={420}
                  height={250}
                  radius={18}
                  metalness={1}
                  roughness={0.28}
                  shine={1.3}
                  bevel={3.5}
                  tiltStrength={11}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-btn onboarding-btn--secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </button>

          <button
            type="button"
            className="onboarding-btn onboarding-btn--primary"
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Finish & Launch Dashboard 🚀' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
