export const validateRegister = (data) => {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('A valid email address is required.');
  }
  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }
  return { isValid: errors.length === 0, errors };
};

export const validateLogin = (data) => {
  const errors = [];
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('A valid email address is required.');
  }
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required.');
  }
  return { isValid: errors.length === 0, errors };
};
