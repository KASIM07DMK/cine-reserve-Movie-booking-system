export const validateMovie = (data) => {
  const errors = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Movie title is required.');
  }
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Movie description is required.');
  }
  if (!data.posterUrl || typeof data.posterUrl !== 'string') {
    errors.push('Movie poster URL is required.');
  }
  if (!data.durationMinutes || typeof data.durationMinutes !== 'number' || data.durationMinutes < 1) {
    errors.push('Duration in minutes must be a positive number.');
  }
  if (!data.releaseDate) {
    errors.push('Release date is required.');
  }
  return { isValid: errors.length === 0, errors };
};
