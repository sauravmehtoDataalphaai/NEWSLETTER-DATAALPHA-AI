import { supabase } from '../lib/supabase';

/**
 * Map a Supabase row to the shape used by the UI.
 */
function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    timestamp: row.created_at,
  };
}

/**
 * Fetch all subscriptions from Supabase (newest first).
 */
export async function getSubmissions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapRow);
}

/**
 * Look up a subscription by email (stored lowercase).
 * Returns the first matching mapped row, or null if not found.
 */
export async function findSubmissionByEmail(email) {
  const normalized = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, name, email, created_at')
    .eq('email', normalized)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] ? mapRow(data[0]) : null;
}

/**
 * Insert a new subscription into Supabase.
 * Returns the updated list.
 */
export async function addSubmission({ name, email }) {
  const { error } = await supabase.from('subscriptions').insert([{ name, email }]);

  if (error) {
    throw new Error(error.message);
  }

  return getSubmissions();
}

/**
 * Delete a subscription by id.
 * Returns the updated list.
 */
export async function removeSubmission(id) {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return getSubmissions();
}

/**
 * Delete all subscription rows matching the given email.
 * Returns { deleted: true, name } or { deleted: false }.
 */
export async function unsubscribeByEmail(email) {
  const existing = await findSubmissionByEmail(email);

  if (!existing) {
    return { deleted: false };
  }

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('email', email.trim().toLowerCase());

  if (error) {
    throw new Error(error.message);
  }

  return { deleted: true, name: existing.name };
}

/**
 * Format a Date (or ISO string) as DD/MM/YYYY HH:MM:SS.
 */
export function formatTimestamp(dateInput) {
  const date = new Date(dateInput);
  const pad = (n) => String(n).padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
