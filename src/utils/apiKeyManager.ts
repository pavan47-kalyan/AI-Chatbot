
/**
 * Utility for handling API key storage and retrieval
 */

// The key used for storing the API key in localStorage
const API_KEY_STORAGE_KEY = 'review-rover-api-key';

/**
 * Save the API key to localStorage
 */
export const saveApiKey = (apiKey: string): void => {
  if (!apiKey) {
    throw new Error('API key cannot be empty');
  }
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

/**
 * Get the API key from localStorage
 */
export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

/**
 * Check if an API key is already saved
 */
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

/**
 * Clear the saved API key
 */
export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};
