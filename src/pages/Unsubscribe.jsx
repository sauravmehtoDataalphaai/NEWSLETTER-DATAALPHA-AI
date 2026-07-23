import BrandLogo from '../components/BrandLogo';
import UnsubscribeForm from '../components/UnsubscribeForm';

/**
 * Public unsubscribe page — email-only form to leave the newsletter.
 */
function Unsubscribe() {
  return (
    <div className="page home-page">
      <div className="subscribe-shell">
        <header className="public-header">
          <BrandLogo />
        </header>

        <main className="form-only-layout">
          <UnsubscribeForm />
        </main>
      </div>
    </div>
  );
}

export default Unsubscribe;
