const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const createThemeCheckout = async (themeId, token) => {
  try {
    const response = await fetch(`${API_URL}/payments/checkout/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ themeId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createExportCheckout = async (format, token) => {
  try {
    const response = await fetch(`${API_URL}/payments/checkout/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserPurchases = async (token) => {
  try {
    const response = await fetch(`${API_URL}/payments/purchases`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchases');
    }

    const data = await response.json();
    return { success: true, purchasedThemes: data.purchasedThemes || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

