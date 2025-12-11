import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppFlow } from '../context/AppFlowContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { consentService } from '../services/consentService';
import Welcome from '../pages/Welcome';
import ConsentForm from '../pages/ConsentForm';
import FlowTaskSelection from './FlowTaskSelection';
import Results from '../pages/Results';
import { HANDWRITING_TASKS } from '../data/handwritingTasks';
import { getTestComponent } from '../utils/testTaskMapping';

const FlowContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
  overflow-x: hidden;
`;

const StepIndicator = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e9ecef;
  z-index: 1000;
`;

const StepProgress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StepContainer = styled(motion.div)`
  width: 100%;
  min-height: 100vh;
`;

const getStepProgress = (step: string): number => {
  const stepMap: Record<string, number> = {
    welcome: 0,
    consent: 25,
    tasks: 50,
    test: 75,
    results: 100,
  };
  return stepMap[step] || 0;
};

const AppFlow: React.FC = () => {
  const { state, goToStep, setConsentAccepted } = useAppFlow();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Check consent status on mount and handle routing
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkConsent = async () => {
      try {
        const accepted = await consentService.isConsentAccepted();
        setConsentAccepted(accepted);
        
        // If consent is accepted, go to tasks
        if (accepted) {
          goToStep('tasks');
        } else {
          // Check if user has seen welcome
          const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
          if (hasSeenWelcome) {
            goToStep('consent');
          } else {
            goToStep('welcome');
          }
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        goToStep('welcome');
      } finally {
        setLoading(false);
      }
    };

    checkConsent();
  }, [user, navigate, goToStep, setConsentAccepted]);

  // Handle step navigation from child components
  const handleWelcomeNext = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    goToStep('consent');
  };

  const handleConsentNext = async () => {
    await consentService.setConsentAccepted(true);
    setConsentAccepted(true);
    goToStep('tasks');
  };

  const handleTaskSelect = (taskId: string) => {
    goToStep('test', taskId);
  };

  const handleTestComplete = () => {
    goToStep('tasks');
  };

  const handleViewResults = () => {
    goToStep('results');
  };

  if (loading) {
    return (
      <FlowContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          Loading...
        </div>
      </FlowContainer>
    );
  }

  const progress = getStepProgress(state.currentStep);
  const TestComponent = state.currentTestId 
    ? getTestComponent(state.currentTestId) 
    : null;

  return (
    <FlowContainer>
      <StepIndicator>
        <StepProgress
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </StepIndicator>

      <AnimatePresence mode="wait">
        {state.currentStep === 'welcome' && (
          <StepContainer
            key="welcome"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeFlowStep onNext={handleWelcomeNext} />
          </StepContainer>
        )}

        {state.currentStep === 'consent' && (
          <StepContainer
            key="consent"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ConsentFlowStep onNext={handleConsentNext} />
          </StepContainer>
        )}

        {state.currentStep === 'tasks' && (
          <StepContainer
            key="tasks"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <TaskSelectionFlowStep 
              onTaskSelect={handleTaskSelect}
              onViewResults={handleViewResults}
            />
          </StepContainer>
        )}

        {state.currentStep === 'test' && TestComponent && (
          <StepContainer
            key={`test-${state.currentTestId}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <TestWrapper 
              TestComponent={TestComponent}
              testId={state.currentTestId!}
              onComplete={handleTestComplete}
            />
          </StepContainer>
        )}

        {state.currentStep === 'results' && (
          <StepContainer
            key="results"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsFlowStep onBackToTasks={() => goToStep('tasks')} />
          </StepContainer>
        )}
      </AnimatePresence>
    </FlowContainer>
  );
};

// Wrapper components for each step
const WelcomeFlowStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <div style={{ position: 'relative' }}>
      <Welcome />
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000
      }}>
        <button
          onClick={onNext}
          style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)',
          }}
        >
          Continue to Consent →
        </button>
      </div>
    </div>
  );
};

const ConsentFlowStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const { previousStep } = useAppFlow();

  React.useEffect(() => {
    const handleConsentChange = (e: CustomEvent) => {
      setConsentGiven(e.detail.checked);
    };
    window.addEventListener('consentChange' as any, handleConsentChange as EventListener);
    return () => {
      window.removeEventListener('consentChange' as any, handleConsentChange as EventListener);
    };
  }, []);

  const handleConsent = async () => {
    if (!consentGiven) return;
    setSaving(true);
    try {
      await onNext();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <ConsentFormWrapper onConsentChange={setConsentGiven} />
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={previousStep}
          style={{
            padding: '16px 32px',
            background: '#f8f9fa',
            color: '#6c757d',
            border: '2px solid #e9ecef',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleConsent}
          disabled={!consentGiven || saving}
          style={{
            padding: '16px 32px',
            background: consentGiven && !saving 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#e9ecef',
            color: consentGiven && !saving ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: consentGiven && !saving ? 'pointer' : 'not-allowed',
            boxShadow: consentGiven && !saving 
              ? '0 8px 30px rgba(102, 126, 234, 0.3)'
              : 'none',
          }}
        >
          {saving ? 'Saving...' : 'I Consent - Begin Assessment →'}
        </button>
      </div>
    </div>
  );
};

const ConsentFormWrapper: React.FC<{ onConsentChange: (checked: boolean) => void }> = ({ onConsentChange }) => {
  React.useEffect(() => {
    // Monitor consent checkbox changes
    const interval = setInterval(() => {
      const checkbox = document.querySelector('#consent') as HTMLInputElement;
      if (checkbox) {
        onConsentChange(checkbox.checked);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onConsentChange]);

  return <ConsentForm />;
};

const TaskSelectionFlowStep: React.FC<{ 
  onTaskSelect: (taskId: string) => void;
  onViewResults: () => void;
}> = ({ onTaskSelect, onViewResults }) => {
  return (
    <div>
      <FlowTaskSelection 
        onTaskSelect={onTaskSelect}
        onViewResults={onViewResults}
      />
    </div>
  );
};

const TestWrapper: React.FC<{ 
  TestComponent: React.ComponentType<any>;
  testId: string;
  onComplete: () => void;
}> = ({ TestComponent, testId, onComplete }) => {
  const { markTestComplete } = useAppFlow();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Intercept clicks on "Next" or "Continue" buttons in TestHarness
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      
      if (button) {
        const buttonText = button.textContent?.toLowerCase() || '';
        if (buttonText.includes('next') || 
            buttonText.includes('continue') ||
            buttonText.includes('proceed')) {
          // Check if it's a navigation button (not a test action button)
          const isNavigationButton = button.closest('[class*="TestHarness"]') ||
                                     button.closest('[class*="test-harness"]');
          
          if (isNavigationButton) {
            e.preventDefault();
            e.stopPropagation();
            markTestComplete(testId);
            onComplete();
            return false;
          }
        }
      }
    };

    container.addEventListener('click', handleClick, true);
    return () => {
      container.removeEventListener('click', handleClick, true);
    };
  }, [testId, onComplete, markTestComplete]);

  return (
    <div ref={containerRef}>
      <TestComponent />
    </div>
  );
};

const ResultsFlowStep: React.FC<{ onBackToTasks: () => void }> = ({ onBackToTasks }) => {
  return (
    <div>
      <Results />
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 1000
      }}>
        <button
          onClick={onBackToTasks}
          style={{
            padding: '16px 32px',
            background: '#f8f9fa',
            color: '#6c757d',
            border: '2px solid #e9ecef',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back to Tasks
        </button>
      </div>
    </div>
  );
};

export default AppFlow;
