import Cookies from 'js-cookie';

/**
 * Safely gets user data from cookies
 * @returns {Object|null} User data or null if not found/invalid
 */
export const getUserFromCookie = () => {
  try {
    const userCookie = Cookies.get('user');
    if (!userCookie || userCookie === 'undefined') {
      return null;
    }
    return JSON.parse(userCookie);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
};

/**
 * Safely gets session token from cookies
 * @returns {string|null} Session token or null if not found
 */
export const getSessionFromCookie = () => {
  const session = Cookies.get('session');
  return session && session !== 'undefined' ? session : null;
};

/**
 * Checks if user is properly authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const user = getUserFromCookie();
  const session = getSessionFromCookie();
  return user && user._id && session;
};

/**
 * Clears user session data
 */
export const clearSession = () => {
  Cookies.remove('user');
  Cookies.remove('session');
};
