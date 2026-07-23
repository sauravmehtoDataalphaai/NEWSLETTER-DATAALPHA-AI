import { useEffect, useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import SubmissionTable from '../components/SubmissionTable';
import { isAdminLoggedIn, loginAdmin, logoutAdmin } from '../utils/auth';
import { getSubmissions } from '../utils/storage';

/**
 * Admin page (/admin)
 * 1. Login with username: admin / password: Admin@123
 * 2. Then show all subscriber submissions from Supabase
 */
function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (err) {
      setLoadError(err.message || 'Could not load subscribers from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // Restore session if admin already logged in
  useEffect(() => {
    if (isAdminLoggedIn()) {
      setLoggedIn(true);
    }
  }, []);

  // Load + refresh data when logged in
  useEffect(() => {
    if (!loggedIn) return;

    loadSubmissions();

    const onFocus = () => loadSubmissions();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }

    if (loginAdmin(username.trim(), password)) {
      setLoggedIn(true);
      setPassword('');
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setLoggedIn(false);
    setUsername('');
    setPassword('');
    setError('');
    setSubmissions([]);
    setLoadError('');
  };

  if (!loggedIn) {
    return (
      <div className="page admin-page">
        <div className="subscribe-shell">
          <header className="public-header">
            <BrandLogo />
          </header>

          <main className="form-only-layout">
            <section className="form-card subscribe-card">
              <header className="form-header">
                <p className="form-eyebrow">Admin</p>
                <h1 className="form-title">Sign in</h1>
                <p className="form-subtitle">
                  Enter your admin credentials to view subscriber data.
                </p>
              </header>

              <div className="form-divider" aria-hidden="true" />

              <form className="subscription-form" onSubmit={handleLogin} noValidate>
                <div className="field">
                  <label htmlFor="adminUsername">Username</label>
                  <input
                    id="adminUsername"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                  />
                </div>

                <div className="field">
                  <label htmlFor="adminPassword">Password</label>
                  <input
                    id="adminPassword"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                  />
                </div>

                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <nav className="top-nav">
        <BrandLogo showAdmin />
        <div className="nav-actions">
          <button type="button" className="btn btn-secondary" onClick={loadSubmissions} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-layout">
        <SubmissionTable
          submissions={submissions}
          onDelete={setSubmissions}
          loading={loading}
          loadError={loadError}
        />
      </main>
    </div>
  );
}

export default Admin;
