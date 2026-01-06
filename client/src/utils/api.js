// API utilities

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, token } = options;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

/**
 * Generate a family tree image
 */
export async function generateFamilyTree(treeData, token = null) {
  return apiRequest('/generate', {
    method: 'POST',
    body: treeData,
    token,
  });
}

/**
 * Check generation status
 */
export async function checkGenerationStatus() {
  return apiRequest('/generate/status');
}

/**
 * Create a checkout session for a theme
 */
export async function createThemeCheckout(themeId, token) {
  return apiRequest('/payments/create-checkout', {
    method: 'POST',
    body: { themeId },
    token,
  });
}

/**
 * Create a checkout session for premium subscription
 */
export async function createPremiumCheckout(token) {
  return apiRequest('/payments/create-premium-checkout', {
    method: 'POST',
    token,
  });
}

/**
 * Get user's purchases
 */
export async function getUserPurchases(token) {
  return apiRequest('/payments/purchases', { token });
}

/**
 * Get user's saved trees
 */
export async function getUserTrees(token) {
  return apiRequest('/trees', { token });
}

/**
 * Save a tree
 */
export async function saveTree(treeData, token) {
  return apiRequest('/trees', {
    method: 'POST',
    body: treeData,
    token,
  });
}

export { API_URL };

