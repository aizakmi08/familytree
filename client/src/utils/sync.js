import { storage } from './storage';
import { useAuthStore } from '../store/authStore';
import { useTreeStore } from '../store/treeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const syncTreeToCloud = async (tree) => {
  const { token, isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated || !token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_URL}/trees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: tree.id,
        name: tree.name,
        theme: tree.theme,
        people: tree.people,
        relationships: tree.relationships,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync tree');
    }

    const syncedTree = await response.json();
    return { success: true, tree: syncedTree };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loadTreesFromCloud = async () => {
  const { token, isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated || !token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_URL}/trees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load trees');
    }

    const trees = await response.json();
    return { success: true, trees };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const promptSaveToCloud = () => {
  const { isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated) {
    const shouldSave = window.confirm(
      'Create an account to save your family tree to the cloud and access it from any device. Would you like to sign up?'
    );
    
    if (shouldSave) {
      // Open auth modal - this will be handled by the component
      return true;
    }
  }
  
  return false;
};

