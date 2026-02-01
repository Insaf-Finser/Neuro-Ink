import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type DiseaseType = 'alzheimers' | 'parkinsons';

interface DiseaseContextType {
  currentDisease: DiseaseType;
  setDisease: (disease: DiseaseType) => void;
}

const DiseaseContext = createContext<DiseaseContextType | undefined>(undefined);

export const useDisease = () => {
  const context = useContext(DiseaseContext);
  if (context === undefined) {
    throw new Error('useDisease must be used within a DiseaseProvider');
  }
  return context;
};

interface DiseaseProviderProps {
  children: ReactNode;
}

export const DiseaseProvider: React.FC<DiseaseProviderProps> = ({ children }) => {
  // Load persisted disease from localStorage or default to 'alzheimers'
  const getInitialDisease = (): DiseaseType => {
    if (typeof window !== 'undefined') {
      const persisted = localStorage.getItem('selectedDisease');
      if (persisted === 'alzheimers' || persisted === 'parkinsons') {
        return persisted;
      }
    }
    return 'alzheimers';
  };

  const [currentDisease, setCurrentDisease] = useState<DiseaseType>(getInitialDisease);

  // Persist disease changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDisease', currentDisease);
    }
  }, [currentDisease]);

  const value: DiseaseContextType = {
    currentDisease,
    setDisease: setCurrentDisease,
  };

  return <DiseaseContext.Provider value={value}>{children}</DiseaseContext.Provider>;
};

