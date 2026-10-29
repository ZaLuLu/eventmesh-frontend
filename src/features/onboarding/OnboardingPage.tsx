import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Stepper } from '@/components/Stepper';
import { api } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/design-system/primitives/Toast';
import { fireCelebrationConfetti } from '@/lib/confetti';
import './OnboardingPage.css';

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

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  // If already completed onboarding, redirect straight to dashboard (unless reset/test mode requested)
  useEffect(() => {
    const isReset = new URLSearchParams(window.location.search).get('reset') === 'true';
    if (!isReset && !isAuthLoading && session && session.onboarding_completed) {
      navigate('/attendee/dashboard', { replace: true });
    }
  }, [session, isAuthLoading, navigate]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const importedAvatar =
    session?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  const [formData, setFormData] = useState({
    name: session?.name || 'Suraj Naik',
    avatarUrl: importedAvatar,
    tagline: session?.tagline || 'Undergraduate Developer & Tech Explorer',
    campus: session?.campus || session?.institutionName || 'Central Technological University (CTU)',
    degreeBranch: session?.degreeBranch || session?.branch || 'Computer Science & Engineering',
    semester: session?.semester || 6,
    registrationNumber: session?.registrationNumber || session?.studentId || 'CTU-2026-0814',
    phone: session?.phone || '+91 98765 43210',
    interests: session?.interests || ['Hackathons & Coding', 'UI/UX Design'],
  });

  // Keep form in sync when session loads
  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || session.name || '',
        avatarUrl: session.avatar || prev.avatarUrl,
        campus: prev.campus || session.campus || session.institutionName || '',
        degreeBranch: prev.degreeBranch || session.degreeBranch || session.branch || '',
        registrationNumber: prev.registrationNumber || session.registrationNumber || session.studentId || '',
        phone: prev.phone || session.phone || '',
      }));
    }
  }, [session]);

  const steps = [
    { title: 'Identity', description: 'Account & Name' },
    { title: 'Academics', description: 'Campus & Roll No' },
    { title: 'Interests', description: 'Event Passions' },
    { title: 'Ready', description: 'Launch Profile' },
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

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    if (currentStep === 0) {
      if (!formData.name.trim()) {
        errors.name = 'Please provide your full name.';
      }
    } else if (currentStep === 1) {
      if (!formData.campus.trim()) {
        errors.campus = 'Institution or university name is required.';
      }
      if (!formData.degreeBranch.trim()) {
        errors.degreeBranch = 'Department / Program is required.';
      }
      if (!formData.registrationNumber.trim()) {
        errors.registrationNumber = 'Student roll number or registration ID is required.';
      }
    } else if (currentStep === 2) {
      if (formData.interests.length === 0) {
        errors.interests = 'Please select at least 1 interest to tailor your campus feed.';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setSubmitError(null);
    if (!validateCurrentStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    setValidationErrors({});
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || formData.name.trim();
      const lastName = nameParts.slice(1).join(' ') || '';

      if (api.auth.completeOnboarding) {
        await api.auth.completeOnboarding({
          display_name: formData.name.trim(),
          first_name: firstName,
          last_name: lastName,
          avatar_url: formData.avatarUrl,
          institution_name: formData.campus.trim(),
          student_id: formData.registrationNumber.trim(),
          degree_branch: formData.degreeBranch.trim(),
          semester: formData.semester,
          tagline: formData.tagline.trim(),
          interests: formData.interests,
          phone: formData.phone.trim(),
        });
      }

      try {
        localStorage.setItem('eventmesh_onboarding_profile', JSON.stringify(formData));
        localStorage.setItem('eventmesh_onboarding_completed', 'true');
      } catch {}

      await queryClient.invalidateQueries({ queryKey: ['auth'] }).catch(() => {});

      fireCelebrationConfetti();
      toast({
        title: 'Welcome to EventMesh! 🚀',
        message: 'Your official collegiate credentials have been verified.',
        type: 'success',
      });

      navigate('/attendee/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      const isConflict =
        err?.message?.includes('already registered') ||
        err?.message?.includes('conflict') ||
        err?.status === 409;
      const msg = isConflict
        ? 'That student ID is already registered at this institution. Please check your roll number or contact campus desk.'
        : err?.message || 'Failed to submit onboarding profile. Please check your connection and try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-page">
      {/* Crisp Brand Header */}
      <header className="onboarding-page__header">
        <Link to="/" className="onboarding-page__brand">
          <span className="onboarding-page__brand-pill">EM</span>
          <span className="onboarding-page__brand-name">EventMesh</span>
        </Link>
        <span className="onboarding-page__badge">One-Time Setup</span>
      </header>

      {/* Main Focus Area (No Grey Filter / Clean Surface) */}
      <main className="onboarding-page__main">
        <div className="onboarding-page__card">
          <div className="onboarding-page__stepper-wrap">
            <Stepper
              steps={steps}
              activeStep={currentStep}
              onStepChange={(idx) => {
                if (!isSubmitting) {
                  setSubmitError(null);
                  setCurrentStep(idx);
                }
              }}
              framed
            />
          </div>

          {submitError && (
            <div className="onboarding-page__error-banner" role="alert">
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <div className="onboarding-page__step-content">
            {/* STEP 1: Welcome & Identity */}
            {currentStep === 0 && (
              <div>
                <div className="onboarding-page__step-head">
                  <h1 className="onboarding-page__step-title">Welcome to EventMesh!</h1>
                  <p className="onboarding-page__step-desc">
                    Let's confirm your identity. Your collegiate credential and event passes will be registered under this name.
                  </p>
                </div>

                {/* Auto-imported Profile Picture Notice */}
                <div className="onboarding-page__avatar-banner">
                  <img
                    src={formData.avatarUrl}
                    alt={formData.name}
                    className="onboarding-page__avatar-img"
                  />
                  <div className="onboarding-page__avatar-info">
                    <span className="onboarding-page__avatar-status">
                      ✓ Profile Picture Imported
                    </span>
                    <span className="onboarding-page__avatar-note">
                      Imported from your authentication account. You can update or change your avatar anytime in Profile Settings.
                    </span>
                  </div>
                </div>

                <div className="onboarding-page__form">
                  <div className="onboarding-page__field">
                    <label className="onboarding-page__label" htmlFor="fullName">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className="onboarding-page__input"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (validationErrors.name)
                          setValidationErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="e.g. Suraj Naik"
                      aria-invalid={Boolean(validationErrors.name)}
                    />
                    {validationErrors.name && (
                      <span className="onboarding-page__error-hint">{validationErrors.name}</span>
                    )}
                  </div>

                  <div className="onboarding-page__field">
                    <label className="onboarding-page__label" htmlFor="tagline">
                      Tagline / One-line Bio
                    </label>
                    <input
                      id="tagline"
                      type="text"
                      className="onboarding-page__input"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Undergraduate Developer & Tech Explorer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Academic Credential */}
            {currentStep === 1 && (
              <div>
                <div className="onboarding-page__step-head">
                  <h2 className="onboarding-page__step-title">Collegiate Verification</h2>
                  <p className="onboarding-page__step-desc">
                    Required by university clubs and lab managers to grant verified student ticket tiers and check-in rights.
                  </p>
                </div>

                <div className="onboarding-page__form">
                  <div className="onboarding-page__field">
                    <label className="onboarding-page__label" htmlFor="campus">
                      University / College Institution *
                    </label>
                    <input
                      id="campus"
                      type="text"
                      className="onboarding-page__input"
                      value={formData.campus}
                      onChange={(e) => {
                        setFormData({ ...formData, campus: e.target.value });
                        if (validationErrors.campus)
                          setValidationErrors((prev) => ({ ...prev, campus: '' }));
                      }}
                      placeholder="e.g. Central Technological University (CTU)"
                      aria-invalid={Boolean(validationErrors.campus)}
                    />
                    {validationErrors.campus && (
                      <span className="onboarding-page__error-hint">{validationErrors.campus}</span>
                    )}
                  </div>

                  <div className="onboarding-page__row onboarding-page__row--2">
                    <div className="onboarding-page__field">
                      <label className="onboarding-page__label" htmlFor="degreeBranch">
                        Department / Program *
                      </label>
                      <input
                        id="degreeBranch"
                        type="text"
                        className="onboarding-page__input"
                        value={formData.degreeBranch}
                        onChange={(e) => {
                          setFormData({ ...formData, degreeBranch: e.target.value });
                          if (validationErrors.degreeBranch)
                            setValidationErrors((prev) => ({ ...prev, degreeBranch: '' }));
                        }}
                        placeholder="e.g. Computer Science & Engineering"
                        aria-invalid={Boolean(validationErrors.degreeBranch)}
                      />
                      {validationErrors.degreeBranch && (
                        <span className="onboarding-page__error-hint">
                          {validationErrors.degreeBranch}
                        </span>
                      )}
                    </div>

                    <div className="onboarding-page__field">
                      <label className="onboarding-page__label" htmlFor="semester">
                        Semester
                      </label>
                      <select
                        id="semester"
                        className="onboarding-page__select"
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

                  <div className="onboarding-page__row onboarding-page__row--2">
                    <div className="onboarding-page__field">
                      <label className="onboarding-page__label" htmlFor="regNo">
                        Student Registration / Roll No. *
                      </label>
                      <input
                        id="regNo"
                        type="text"
                        className="onboarding-page__input"
                        value={formData.registrationNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, registrationNumber: e.target.value });
                          if (validationErrors.registrationNumber)
                            setValidationErrors((prev) => ({ ...prev, registrationNumber: '' }));
                        }}
                        placeholder="e.g. CTU-2026-0814"
                        aria-invalid={Boolean(validationErrors.registrationNumber)}
                      />
                      {validationErrors.registrationNumber && (
                        <span className="onboarding-page__error-hint">
                          {validationErrors.registrationNumber}
                        </span>
                      )}
                    </div>

                    <div className="onboarding-page__field">
                      <label className="onboarding-page__label" htmlFor="phone">
                        Contact Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="onboarding-page__input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Campus Passions & Event Preferences */}
            {currentStep === 2 && (
              <div>
                <div className="onboarding-page__step-head">
                  <h2 className="onboarding-page__step-title">Campus Passions & Preferences</h2>
                  <p className="onboarding-page__step-desc">
                    Select 2 or more topics to personalize your campus recommendations, workshops, and team invites.
                  </p>
                </div>

                <div className="onboarding-page__tags-grid">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const selected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        className={`onboarding-page__tag ${
                          selected ? 'onboarding-page__tag--selected' : ''
                        }`}
                        onClick={() => {
                          handleInterestToggle(interest);
                          if (validationErrors.interests)
                            setValidationErrors((prev) => ({ ...prev, interests: '' }));
                        }}
                      >
                        {selected ? '✓ ' : '+ '} {interest}
                      </button>
                    );
                  })}
                </div>

                {validationErrors.interests && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span className="onboarding-page__error-hint">
                      {validationErrors.interests}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Ready & Confirmation (NO metallic card on wizard) */}
            {currentStep === 3 && (
              <div>
                <div className="onboarding-page__step-head">
                  <h2 className="onboarding-page__step-title">You're All Set!</h2>
                  <p className="onboarding-page__step-desc">
                    Your collegiate attendee profile has been configured. Review your credentials below and enter your dashboard.
                  </p>
                </div>

                <div className="onboarding-page__summary-box">
                  <div className="onboarding-page__summary-row">
                    <span className="onboarding-page__summary-label">Attendee Name</span>
                    <span className="onboarding-page__summary-val">{formData.name}</span>
                  </div>
                  <div className="onboarding-page__summary-row">
                    <span className="onboarding-page__summary-label">Institution</span>
                    <span className="onboarding-page__summary-val">{formData.campus}</span>
                  </div>
                  <div className="onboarding-page__summary-row">
                    <span className="onboarding-page__summary-label">Department & Semester</span>
                    <span className="onboarding-page__summary-val">
                      {formData.degreeBranch} · Sem {formData.semester}
                    </span>
                  </div>
                  <div className="onboarding-page__summary-row">
                    <span className="onboarding-page__summary-label">Roll Number</span>
                    <span className="onboarding-page__summary-val font-mono">
                      {formData.registrationNumber}
                    </span>
                  </div>
                  <div className="onboarding-page__summary-row">
                    <span className="onboarding-page__summary-label">Selected Topics</span>
                    <span className="onboarding-page__summary-val">
                      {formData.interests.length} Categories Linked
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="onboarding-page__actions">
            <button
              type="button"
              className="onboarding-page__btn onboarding-page__btn--secondary"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              ← Back
            </button>

            <button
              type="button"
              className="onboarding-page__btn onboarding-page__btn--primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="onboarding-page__spinner" />
                  <span>Finalizing Setup...</span>
                </>
              ) : currentStep === steps.length - 1 ? (
                'Enter EventMesh Dashboard →'
              ) : (
                'Continue →'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
