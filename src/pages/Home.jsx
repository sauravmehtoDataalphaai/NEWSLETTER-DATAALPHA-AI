import BrandLogo from '../components/BrandLogo';
import SubscriptionForm from '../components/SubscriptionForm';

/**
 * Public home page — subscription form only.
 */
function Home() {
  return (
    <div className="page home-page">
      <div className="subscribe-shell">
        <header className="public-header">
          <BrandLogo />
        </header>

        <main className="form-only-layout">
          <SubscriptionForm />
        </main>
      </div>
    </div>
  );
}

export default Home;
