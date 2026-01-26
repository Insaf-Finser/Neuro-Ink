import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  // Default to 'alzheimers' - the only active disease
  const [currentDisease, setCurrentDisease] = useState<DiseaseType>('alzheimers');

  const value: DiseaseContextType = {
    currentDisease,
    setDisease: setCurrentDisease,
  };

  return <DiseaseContext.Provider value={value}>{children}</DiseaseContext.Provider>;
};

