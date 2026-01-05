const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const uploadImage = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

