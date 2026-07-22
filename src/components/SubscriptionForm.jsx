import { useState } from 'react';
import { addSubmission } from '../utils/storage';

/**
 * SubscriptionForm
 * Validates name + email, saves to Supabase, shows thank-you popup,
 * then attempts to close the browser tab.
 */
function SubscriptionForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [closeBlocked, setCloseBlocked] = useState(false);

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

  const tryCloseWindow = () => {
    window.close();

    setTimeout(() => {
      if (!window.closed) {
        setCloseBlocked(true);
      }
    }, 300);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await addSubmission({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      setName('');
      setEmail('');
      setErrors({});
      setShowThanks(true);
      setCloseBlocked(false);

      setTimeout(() => {
        tryCloseWindow();
      }, 2000);
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
      <section className="form-card">
        <header className="form-header">
          <p className="form-eyebrow">Newsletter</p>
          <h1 className="form-title">Stay in the loop</h1>
          <p className="form-subtitle">
            Partnering with premier teams — enter your details and we&apos;ll be in touch.
          </p>
        </header>

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
            {closeBlocked ? (
              <p className="modal-hint">You can close this tab now.</p>
            ) : (
              <p className="modal-hint">This window will close automatically…</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SubscriptionForm;
