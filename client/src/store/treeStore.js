import { create } from 'zustand';
import { storage, createEmptyTree } from '../utils/storage';

export const useTreeStore = create((set, get) => {
  // Initialize tree from localStorage or create new
  const initializeTree = () => {
    const treeId = storage.getCurrentTreeId();
    let tree = storage.getTree(treeId);
    
    if (!tree) {
      tree = createEmptyTree();
      storage.saveTree(treeId, tree);
      storage.setCurrentTreeId(tree.id);
    }
    
    return tree;
  };

  return {
    tree: initializeTree(),
    selectedPerson: null,
    history: [],
    historyIndex: -1,

    // Tree actions
    setTree: (tree) => {
      set({ tree });
      storage.saveTree(tree.id, tree);
    },

    // Person actions
    addPerson: (personData) => {
      const { tree } = get();
      const newPerson = {
        id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...personData,
        position: personData.position || { x: Math.random() * 400, y: Math.random() * 400 },
      };
      
      const updatedTree = {
        ...tree,
        people: [...tree.people, newPerson],
        updatedAt: new Date().toISOString(),
      };
      
      get().addToHistory(tree);
      set({ tree: updatedTree });
      storage.saveTree(updatedTree.id, updatedTree);
      return newPerson.id; // Return the new person's ID
    },

    updatePerson: (personId, updates) => {
      const { tree } = get();
      const updatedTree = {
        ...tree,
        people: tree.people.map((p) =>
          p.id === personId ? { ...p, ...updates } : p
        ),
        updatedAt: new Date().toISOString(),
      };
      
      get().addToHistory(tree);
      set({ tree: updatedTree });
      storage.saveTree(updatedTree.id, updatedTree);
    },

    deletePerson: (personId) => {
      const { tree } = get();
      const updatedTree = {
        ...tree,
        people: tree.people.filter((p) => p.id !== personId),
        relationships: tree.relationships.filter(
          (r) => r.from !== personId && r.to !== personId
        ),
        updatedAt: new Date().toISOString(),
      };
      
      get().addToHistory(tree);
      set({ tree: updatedTree });
      storage.saveTree(updatedTree.id, updatedTree);
    },

    // Relationship actions
    addRelationship: (fromId, toId, type) => {
      const { tree } = get();
      const newRel = {
        id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from: fromId,
        to: toId,
        type,
      };
      
      // Check if relationship already exists
      const exists = tree.relationships.some(
        (r) => r.from === fromId && r.to === toId && r.type === type
      );
      
      if (exists) return;
      
      const updatedTree = {
        ...tree,
        relationships: [...tree.relationships, newRel],
        updatedAt: new Date().toISOString(),
      };
      
      get().addToHistory(tree);
      set({ tree: updatedTree });
      storage.saveTree(updatedTree.id, updatedTree);
    },

    deleteRelationship: (relId) => {
      const { tree } = get();
      const updatedTree = {
        ...tree,
        relationships: tree.relationships.filter((r) => r.id !== relId),
        updatedAt: new Date().toISOString(),
      };
      
      get().addToHistory(tree);
      set({ tree: updatedTree });
      storage.saveTree(updatedTree.id, updatedTree);
    },

    // Selection
    setSelectedPerson: (personId) => {
      set({ selectedPerson: personId });
    },

    // History/Undo-Redo
    addToHistory: (state) => {
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state)));
      
      set({
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1,
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevState = history[historyIndex - 1];
        set({
          tree: prevState,
          historyIndex: historyIndex - 1,
        });
        storage.saveTree(prevState.id, prevState);
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextState = history[historyIndex + 1];
        set({
          tree: nextState,
          historyIndex: historyIndex + 1,
        });
        storage.saveTree(nextState.id, nextState);
      }
    },
  };
});

