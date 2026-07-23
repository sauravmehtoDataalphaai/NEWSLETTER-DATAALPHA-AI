import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { unsubscribeByEmail } from '../utils/storage';
import {
  REDIRECT_SECONDS,
  canAutoRedirect,
  navigateReturnOrBack,
} from '../utils/returnRedirect';

/**
 * UnsubscribeForm
 * Looks up the email in Supabase and deletes the matching subscription row(s).
 * After success, redirects back (returnUrl / referrer / history) in 5 seconds.
 */
function UnsubscribeForm() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successName, setSuccessName] = useState(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const redirectTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const returnUrl = searchParams.get('returnUrl');
  const willAutoRedirect = canAutoRedirect(returnUrl);
  const isSuccess = successName !== null;

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

  const goBackOrStay = () => {
    clearRedirectTimers();
    navigateReturnOrBack(returnUrl);
  };

  useEffect(() => {
    if (!isSuccess) {
      clearRedirectTimers();
      setCountdown(REDIRECT_SECONDS);
      return undefined;
    }

    setCountdown(REDIRECT_SECONDS);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    redirectTimerRef.current = setTimeout(() => {
      goBackOrStay();
    }, REDIRECT_SECONDS * 1000);

    return clearRedirectTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start timers only when success view opens
  }, [isSuccess]);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitError('');
    setSuccessName(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await unsubscribeByEmail(email);

      if (!result.deleted) {
        setError('No subscription found for this email.');
        return;
      }

      setSuccessName(result.name || '');
      setEmail('');
    } catch (err) {
      setSubmitError(err.message || 'Could not unsubscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    clearRedirectTimers();
    setEmail('');
    setError('');
    setSubmitError('');
    setSuccessName(null);
    setCountdown(REDIRECT_SECONDS);
  };

  return (
    <section className="form-card subscribe-card">
      <header className="form-header">
        <p className="form-eyebrow">Newsletter</p>
        <h1 className="form-title">Unsubscribe</h1>
        <p className="form-subtitle">
          Enter the email you used to subscribe and we&apos;ll remove it from our list.
        </p>
      </header>

      <div className="form-divider" aria-hidden="true" />

      {isSuccess ? (
        <div className="unsubscribe-success" role="status">
          <h2 className="unsubscribe-success-title">You&apos;ve been unsubscribed</h2>
          <p className="unsubscribe-success-text">
            {successName
              ? `${successName}, your email has been removed from our newsletter.`
              : 'Your email has been removed from our newsletter.'}
          </p>
          {willAutoRedirect && (
            <p className="unsubscribe-redirect-hint" aria-live="polite">
              Taking you back in {countdown}s…
            </p>
          )}
          <div className="form-actions">
            {willAutoRedirect ? (
              <button type="button" className="btn btn-primary" onClick={goBackOrStay}>
                Go back
              </button>
            ) : (
              <Link to="/" className="btn btn-primary">
                Back to Subscribe
              </Link>
            )}
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Unsubscribe another
            </button>
          </div>
          {willAutoRedirect && (
            <p className="unsubscribe-footer">
              Or <Link to="/">go back to Subscribe</Link>
            </p>
          )}
        </div>
      ) : (
        <form className="subscription-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="unsubscribeEmail">Email</label>
            <input
              id="unsubscribeEmail"
              type="email"
              name="email"
              placeholder="jane@example.com"
              value={email}
              disabled={isSubmitting}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'unsubscribe-email-error' : undefined}
            />
            {error && (
              <p id="unsubscribe-email-error" className="field-error">
                {error}
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
              {isSubmitting ? 'Removing…' : 'Unsubscribe'}
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

          <p className="unsubscribe-footer">
            Changed your mind? <Link to="/">Subscribe again</Link>
          </p>
        </form>
      )}
    </section>
  );
}

export default UnsubscribeForm;
