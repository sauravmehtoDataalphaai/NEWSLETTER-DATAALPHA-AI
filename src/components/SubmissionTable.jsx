import { useMemo, useState } from 'react';
import { formatTimestamp, removeSubmission } from '../utils/storage';
import './SubmissionTable.css';

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRecency(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (date >= startOfToday) return 'today';
  if (diffDays <= 7) return 'recent';
  return null;
}

function SearchIcon() {
  return (
    <svg className="st-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15V5a2 2 0 0 1 2-2h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 13h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Enhanced subscribers table with search, sort, avatars, and icon actions.
 */
function SubmissionTable({ submissions, onDelete, loading = false, loadError = '' }) {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...submissions];

    if (q) {
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          formatTimestamp(row.timestamp).toLowerCase().includes(q),
      );
    }

    rows.sort((a, b) => {
      let left = a[sortKey];
      let right = b[sortKey];

      if (sortKey === 'timestamp') {
        left = new Date(a.timestamp).getTime();
        right = new Date(b.timestamp).getTime();
      } else {
        left = String(left || '').toLowerCase();
        right = String(right || '').toLowerCase();
      }

      if (left < right) return sortDir === 'asc' ? -1 : 1;
      if (left > right) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [submissions, search, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'timestamp' ? 'desc' : 'asc');
  };

  const sortMarker = (key) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  const handleCopy = async (entry) => {
    try {
      await navigator.clipboard.writeText(entry.email);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeleteError('');
    setDeletingId(id);

    try {
      const updated = await removeSubmission(id);
      if (onDelete) onDelete(updated);
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this entry.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="st-container">
      <section className="table-card st-table-card">
        <header className="st-table-header">
          <div className="st-header-content">
            <h2>Subscribers</h2>
            <p>All form submissions stored in Supabase</p>
          </div>
          <div className="st-count-badge" aria-live="polite">
            <span className="st-count-number">{submissions.length}</span>
            <span>{submissions.length === 1 ? 'subscriber' : 'subscribers'}</span>
          </div>
        </header>

        {(loadError || deleteError) && (
          <div className="st-error-banner" role="alert">
            <span className="st-error-icon" aria-hidden="true">
              ⚠
            </span>
            <span>{loadError || deleteError}</span>
          </div>
        )}

        <div className="st-search-container">
          <SearchIcon />
          <input
            className="st-search-input"
            type="search"
            placeholder="Search by name, email, or date…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search subscribers"
          />
        </div>

        {loading ? (
          <div className="st-loading">Loading subscribers…</div>
        ) : submissions.length === 0 ? (
          <div className="st-empty">
            <div className="st-empty-icon">
              <EmptyIcon />
            </div>
            <p>No submissions yet.</p>
            <p className="st-empty-hint">Share your subscribe link and new entries will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="st-empty">
            <p>No matches for “{search.trim()}”.</p>
            <p className="st-empty-hint">Try a different name or email.</p>
          </div>
        ) : (
          <div className="st-table-wrap">
            <table className="st-table">
              <thead>
                <tr>
                  <th scope="col" onClick={() => handleSort('name')}>
                    Name
                    <span className="st-sort">{sortMarker('name')}</span>
                  </th>
                  <th scope="col" onClick={() => handleSort('email')}>
                    Email
                    <span className="st-sort">{sortMarker('email')}</span>
                  </th>
                  <th scope="col" onClick={() => handleSort('timestamp')}>
                    Timestamp
                    <span className="st-sort">{sortMarker('timestamp')}</span>
                  </th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const recency = getRecency(entry.timestamp);
                  return (
                    <tr key={entry.id}>
                      <td data-label="Name">
                        <div className="st-name-cell">
                          <span className="st-avatar" aria-hidden="true">
                            {getInitials(entry.name)}
                          </span>
                          <span>{entry.name}</span>
                        </div>
                      </td>
                      <td data-label="Email">
                        <div className="st-email-cell">
                          <a href={`mailto:${entry.email}`}>{entry.email}</a>
                        </div>
                      </td>
                      <td data-label="Timestamp">
                        <div className="st-timestamp-cell">
                          <span>{formatTimestamp(entry.timestamp)}</span>
                          {recency === 'today' && (
                            <span className="st-recency st-recency-today">Today</span>
                          )}
                          {recency === 'recent' && (
                            <span className="st-recency st-recency-recent">Recent</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Actions">
                        <div className="st-actions-cell">
                          <div className="st-tooltip-wrap">
                            <button
                              type="button"
                              className="st-icon-btn st-copy-btn"
                              onClick={() => handleCopy(entry)}
                              aria-label={`Copy email for ${entry.name}`}
                              title="Copy email"
                            >
                              <CopyIcon />
                            </button>
                            {copiedId === entry.id && (
                              <span className="st-tooltip st-tooltip-visible">Copied!</span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="st-icon-btn st-delete-btn"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            aria-label={`Delete submission from ${entry.name}`}
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default SubmissionTable;
