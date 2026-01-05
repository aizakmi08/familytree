import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [addPersonModal, setAddPersonModal] = useState({
    isOpen: false,
    relatedPersonId: null,
    relationshipType: null,
  });

  const openAddPersonModal = (relatedPersonId = null, relationshipType = null) => {
    setAddPersonModal({
      isOpen: true,
      relatedPersonId,
      relationshipType,
    });
  };

  const closeAddPersonModal = () => {
    setAddPersonModal({
      isOpen: false,
      relatedPersonId: null,
      relationshipType: null,
    });
  };

  return (
    <ModalContext.Provider
      value={{
        addPersonModal,
        openAddPersonModal,
        closeAddPersonModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

