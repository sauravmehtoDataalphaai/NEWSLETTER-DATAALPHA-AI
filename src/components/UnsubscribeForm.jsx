import { useState } from 'react';
import { Link } from 'react-router-dom';
import { unsubscribeByEmail } from '../utils/storage';

/**
 * UnsubscribeForm
 * Looks up the email in Supabase and deletes the matching subscription row(s).
 */
function UnsubscribeForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successName, setSuccessName] = useState(null);

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
    setEmail('');
    setError('');
    setSubmitError('');
    setSuccessName(null);
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

      {successName !== null ? (
        <div className="unsubscribe-success" role="status">
          <h2 className="unsubscribe-success-title">You&apos;ve been unsubscribed</h2>
          <p className="unsubscribe-success-text">
            {successName
              ? `${successName}, your email has been removed from our newsletter.`
              : 'Your email has been removed from our newsletter.'}
          </p>
          <div className="form-actions">
            <Link to="/" className="btn btn-primary">
              Back to Subscribe
            </Link>
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Unsubscribe another
            </button>
          </div>
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
