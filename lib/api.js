const getUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
};

const apiCall = async (url, options = {}) => {
  const userId = getUserId();
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

module.exports = { apiCall, getUserId };
