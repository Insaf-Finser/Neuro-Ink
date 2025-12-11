import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type FlowStep = 
  | 'welcome'
  | 'consent'
  | 'tasks'
  | 'test'
  | 'results';

interface AppFlowState {
  currentStep: FlowStep;
  currentTestId: string | null;
  completedTests: string[];
  consentAccepted: boolean;
  testResults: Record<string, any>;
}

interface AppFlowContextType {
  state: AppFlowState;
  goToStep: (step: FlowStep, testId?: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  setConsentAccepted: (accepted: boolean) => void;
  markTestComplete: (testId: string, results?: any) => void;
  resetFlow: () => void;
}

const initialState: AppFlowState = {
  currentStep: 'welcome',
  currentTestId: null,
  completedTests: [],
  consentAccepted: false,
  testResults: {},
};

const AppFlowContext = createContext<AppFlowContextType | undefined>(undefined);

export const useAppFlow = () => {
  const context = useContext(AppFlowContext);
  if (!context) {
    throw new Error('useAppFlow must be used within AppFlowProvider');
  }
  return context;
};

interface AppFlowProviderProps {
  children: ReactNode;
}

export const AppFlowProvider: React.FC<AppFlowProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppFlowState>(initialState);

  const goToStep = useCallback((step: FlowStep, testId?: string) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      currentTestId: testId || null,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const stepOrder: FlowStep[] = ['welcome', 'consent', 'tasks', 'test', 'results'];
      const currentIndex = stepOrder.indexOf(prev.currentStep);
      const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
      return {
        ...prev,
        currentStep: stepOrder[nextIndex],
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => {
      const stepOrder: FlowStep[] = ['welcome', 'consent', 'tasks', 'test', 'results'];
      const currentIndex = stepOrder.indexOf(prev.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return {
        ...prev,
        currentStep: stepOrder[prevIndex],
      };
    });
  }, []);

  const setConsentAccepted = useCallback((accepted: boolean) => {
    setState(prev => ({
      ...prev,
      consentAccepted: accepted,
    }));
  }, []);

  const markTestComplete = useCallback((testId: string, results?: any) => {
    setState(prev => ({
      ...prev,
      completedTests: [...prev.completedTests.filter(id => id !== testId), testId],
      testResults: {
        ...prev.testResults,
        [testId]: results,
      },
    }));
  }, []);

  const resetFlow = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <AppFlowContext.Provider
      value={{
        state,
        goToStep,
        nextStep,
        previousStep,
        setConsentAccepted,
        markTestComplete,
        resetFlow,
      }}
    >
      {children}
    </AppFlowContext.Provider>
  );
};
