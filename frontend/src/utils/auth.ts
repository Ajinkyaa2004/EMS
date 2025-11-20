// Utility to get the current auth token from sessionStorage based on role
export const getToken = (): string | null => {
  // Try all possible role keys
  const roles = ['admin', 'employee', 'client', 'freelancer', 'trainee'];
  for (const role of roles) {
    const token = sessionStorage.getItem(`auth_${role}_token`);
    if (token) {
      return token;
    }
  }
  return null;
};

// Utility to get the current user from localStorage
export const getUser = (): any => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Utility to get auth headers
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
