import { useState } from 'react';
import { formatTimestamp, removeSubmission } from '../utils/storage';

/**
 * SubmissionTable
 * Displays all subscription submissions from Supabase.
 */
function SubmissionTable({ submissions, onDelete, loading = false, loadError = '' }) {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id) => {
    setDeleteError('');
    setDeletingId(id);

    try {
      const updated = await removeSubmission(id);
      if (onDelete) {
        onDelete(updated);
      }
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this entry.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="table-card">
      <header className="table-header">
        <div>
          <h2 className="table-title">Subscribers</h2>
          <p className="table-subtitle">All form submissions stored in Supabase</p>
        </div>
        <div className="count-badge" aria-live="polite">
          <span className="count-number">{submissions.length}</span>
          <span className="count-label">
            {submissions.length === 1 ? 'subscriber' : 'subscribers'}
          </span>
        </div>
      </header>

      {loadError && (
        <p className="field-error" role="alert">
          {loadError}
        </p>
      )}

      {deleteError && (
        <p className="field-error" role="alert">
          {deleteError}
        </p>
      )}

      {loading ? (
        <div className="empty-state">
          <p>Loading subscribers…</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <p>No submissions yet.</p>
          <p className="empty-hint">Share your subscribe link and new entries will appear here.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="submissions-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Timestamp</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="Name">{entry.name}</td>
                  <td data-label="Email">{entry.email}</td>
                  <td data-label="Timestamp">{formatTimestamp(entry.timestamp)}</td>
                  <td data-label="Actions">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      aria-label={`Delete submission from ${entry.name}`}
                    >
                      {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default SubmissionTable;
