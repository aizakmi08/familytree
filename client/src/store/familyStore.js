import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate unique IDs
const generateId = () => `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useFamilyStore = create(
  persist(
    (set, get) => ({
      // State
      members: [],
      relationships: [],
      selectedTheme: 'classic',
      treeName: 'My Family Tree',
      
      // Generated results
      generations: [],
      isGenerating: false,
      
      // Member actions
      addMember: (memberData) => {
        const newMember = {
          id: generateId(),
          name: memberData.name,
          photoUrl: memberData.photoUrl || null,
          birthYear: memberData.birthYear || null,
          deathYear: memberData.deathYear || null,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          members: [...state.members, newMember],
        }));
        
        return newMember.id;
      },
      
      updateMember: (memberId, updates) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, ...updates } : m
          ),
        }));
      },
      
      deleteMember: (memberId) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== memberId),
          // Also remove relationships involving this member
          relationships: state.relationships.filter(
            (r) => r.from !== memberId && r.to !== memberId
          ),
        }));
      },
      
      getMember: (memberId) => {
        return get().members.find((m) => m.id === memberId);
      },
      
      // Relationship actions
      addRelationship: (fromId, toId, type) => {
        const { relationships } = get();
        
        // Check if relationship already exists
        const exists = relationships.some(
          (r) => r.from === fromId && r.to === toId && r.type === type
        );
        
        if (exists) return null;
        
        const newRelationship = {
          id: `rel_${Date.now()}`,
          from: fromId,
          to: toId,
          type,
        };
        
        set((state) => ({
          relationships: [...state.relationships, newRelationship],
        }));
        
        return newRelationship.id;
      },
      
      deleteRelationship: (relationshipId) => {
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== relationshipId),
        }));
      },
      
      getRelationshipsFor: (memberId) => {
        return get().relationships.filter(
          (r) => r.from === memberId || r.to === memberId
        );
      },
      
      // Theme actions
      setTheme: (themeId) => {
        set({ selectedTheme: themeId });
      },
      
      // Tree actions
      setTreeName: (name) => {
        set({ treeName: name });
      },
      
      // Generation actions
      addGeneration: (generation) => {
        set((state) => ({
          generations: [generation, ...state.generations],
        }));
      },
      
      setGenerating: (isGenerating) => {
        set({ isGenerating });
      },
      
      // Reset tree
      resetTree: () => {
        set({
          members: [],
          relationships: [],
          selectedTheme: 'classic',
          treeName: 'My Family Tree',
        });
      },
      
      // Check if ready to generate
      canGenerate: () => {
        const { members, relationships } = get();
        return members.length >= 2 && relationships.length >= 1;
      },
      
      // Get tree data for API
      getTreeData: () => {
        const { members, relationships, selectedTheme, treeName } = get();
        return {
          name: treeName,
          theme: selectedTheme,
          members,
          relationships,
        };
      },
    }),
    {
      name: 'family-tree-storage',
      partialize: (state) => ({
        members: state.members,
        relationships: state.relationships,
        selectedTheme: state.selectedTheme,
        treeName: state.treeName,
        generations: state.generations,
      }),
    }
  )
);

