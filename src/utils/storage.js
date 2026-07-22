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
