// Local storage abstraction for family trees

const STORAGE_KEY = 'familytree_data';
const TREES_KEY = 'familytree_trees';

export const storage = {
  // Save a tree to local storage
  saveTree: (treeId, treeData) => {
    try {
      const trees = storage.getAllTrees();
      trees[treeId] = {
        ...treeData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(TREES_KEY, JSON.stringify(trees));
      return true;
    } catch (error) {
      console.error('Error saving tree to localStorage:', error);
      return false;
    }
  },

  // Get a tree from local storage
  getTree: (treeId) => {
    try {
      const trees = storage.getAllTrees();
      return trees[treeId] || null;
    } catch (error) {
      console.error('Error getting tree from localStorage:', error);
      return null;
    }
  },

  // Get all trees
  getAllTrees: () => {
    try {
      const data = localStorage.getItem(TREES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting trees from localStorage:', error);
      return {};
    }
  },

  // Delete a tree
  deleteTree: (treeId) => {
    try {
      const trees = storage.getAllTrees();
      delete trees[treeId];
      localStorage.setItem(TREES_KEY, JSON.stringify(trees));
      return true;
    } catch (error) {
      console.error('Error deleting tree from localStorage:', error);
      return false;
    }
  },

  // Get current tree ID (for guest mode)
  getCurrentTreeId: () => {
    try {
      return localStorage.getItem('current_tree_id') || 'default';
    } catch (error) {
      return 'default';
    }
  },

  // Set current tree ID
  setCurrentTreeId: (treeId) => {
    try {
      localStorage.setItem('current_tree_id', treeId);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Clear all data (for logout or reset)
  clearAll: () => {
    try {
      localStorage.removeItem(TREES_KEY);
      localStorage.removeItem('current_tree_id');
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Tree data structure helper
export const createEmptyTree = () => ({
  id: `tree_${Date.now()}`,
  name: 'My Family Tree',
  theme: 'classic',
  people: [],
  relationships: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Person data structure
export const createPerson = (data) => ({
  id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: data.name || '',
  photo: data.photo || null,
  birthDate: data.birthDate || null,
  deathDate: data.deathDate || null,
  bio: data.bio || '',
  position: data.position || { x: 0, y: 0 },
});

// Relationship data structure
export const createRelationship = (fromId, toId, type) => ({
  id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  from: fromId,
  to: toId,
  type: type, // 'parent', 'child', 'spouse', 'sibling'
});

