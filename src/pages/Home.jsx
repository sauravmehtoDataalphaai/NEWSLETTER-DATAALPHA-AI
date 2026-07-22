import SubscriptionForm from '../components/SubscriptionForm';

/**
 * Public home page — subscription form only.
 * Share this URL after deploy (e.g. your Render link).
 */
function Home() {
  return (
    <div className="page home-page">
      <header className="public-header">
        <p className="brand">DATAALPHA AI</p>
      </header>

      <main className="form-only-layout">
        <SubscriptionForm />
      </main>
    </div>
  );
}

export default Home;
