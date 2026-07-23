import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addSubmission, findSubmissionByEmail } from '../utils/storage';
import {
  REDIRECT_SECONDS,
  canAutoRedirect,
  navigateReturnOrBack,
} from '../utils/returnRedirect';

/**
 * SubscriptionForm
 * Validates name + email, blocks duplicates, saves to Supabase, then shows a thank-you popup.
 * After success, redirects back (returnUrl / referrer / history) in 5 seconds; OK redirects immediately.
 */
function SubscriptionForm() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const redirectTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const returnUrl = searchParams.get('returnUrl');
  const willAutoRedirect = canAutoRedirect(returnUrl);

  const clearRedirectTimers = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const goBackOrClose = () => {
    clearRedirectTimers();
    const navigated = navigateReturnOrBack(returnUrl);
    if (!navigated) {
      setShowThanks(false);
      return;
    }
    // If history.back() doesn't leave the page, close the modal shortly after.
    setTimeout(() => setShowThanks(false), 400);
  };

  useEffect(() => {
    if (!showThanks) {
      clearRedirectTimers();
      setCountdown(REDIRECT_SECONDS);
      return undefined;
    }

    setCountdown(REDIRECT_SECONDS);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    redirectTimerRef.current = setTimeout(() => {
      goBackOrClose();
    }, REDIRECT_SECONDS * 1000);

    return clearRedirectTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start timers only when modal opens
  }, [showThanks]);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validate = () => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await findSubmissionByEmail(normalizedEmail);

      if (existing) {
        setErrors({ email: 'This email is already subscribed.' });
        return;
      }

      await addSubmission({
        name: name.trim(),
        email: normalizedEmail,
      });

      setName('');
      setEmail('');
      setErrors({});
      setShowThanks(true);
    } catch (err) {
      setSubmitError(err.message || 'Could not save your subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setName('');
    setEmail('');
    setErrors({});
    setSubmitError('');
  };

  return (
    <>
      <section className="form-card subscribe-card">
        <header className="form-header">
          <p className="form-eyebrow">Newsletter</p>
          <h1 className="form-title">Stay Connected</h1>
          <p className="form-subtitle">Enter your details and we&apos;ll be in touch.</p>
        </header>

        <div className="form-divider" aria-hidden="true" />

        <form className="subscription-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Jane Doe"
              value={name}
              disabled={isSubmitting}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="field-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="jane@example.com"
              value={email}
              disabled={isSubmitting}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="field-error">
                {errors.email}
              </p>
            )}
          </div>

          {submitError && (
            <p className="field-error" role="alert">
              {submitError}
            </p>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Subscribe'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={isSubmitting}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {showThanks && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="thanks-title">
          <div className="modal-card">
            <h2 id="thanks-title" className="modal-title">
              Thank you!
            </h2>
            <p className="modal-text">We will contact you soon.</p>
            {willAutoRedirect && (
              <p className="modal-hint" aria-live="polite">
                Taking you back in {countdown}s…
              </p>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={goBackOrClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SubscriptionForm;
