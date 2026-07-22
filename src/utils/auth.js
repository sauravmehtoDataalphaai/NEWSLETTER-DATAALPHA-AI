// Admin auth stored in sessionStorage (clears when browser closes)
const AUTH_KEY = 'letterlink_admin_auth';

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'Admin@123';

export function isAdminLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

export function loginAdmin(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
}
