import React from 'react';
import styled from 'styled-components';

const Harness = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #1f2937;
`;

const ProgressBar = styled.div`
  width: 160px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number; $complete?: boolean }>`
  height: 100%;
  width: ${({ $percent }) => Math.min(100, Math.max(0, $percent))}%;
  background: ${({ $complete }) => ($complete ? '#10b981' : '#667eea')};
  transition: width 0.3s ease, background 0.3s ease;
`;

const Instructions = styled.div`
  background: #f8f9ff;
  border: 2px solid #e8ecff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  `}
`;

interface TestHarnessProps {
  title: string;
  step: number;
  totalSteps: number;
  instructions: React.ReactNode;
  children: React.ReactNode;
  isComplete?: boolean;
  onRetry?: () => void;
  onNext?: () => void;
  canProceed?: boolean;
}

const TestHarness: React.FC<TestHarnessProps> = ({
  title,
  step,
  totalSteps,
  instructions,
  children,
  isComplete = false,
  onRetry,
  onNext,
  canProceed
}) => {
  const percent = isComplete ? 100 : Math.round((step / totalSteps) * 100);
  return (
    <Harness>
      <Header>
        <Title>{title}</Title>
        <Progress>
          Step {step} / {totalSteps}
          <ProgressBar>
            <ProgressFill $percent={percent} $complete={isComplete} />
          </ProgressBar>
        </Progress>
      </Header>
      <Instructions>{instructions}</Instructions>
      {children}
      <Footer>
        {onRetry && <Button onClick={onRetry}>Retry</Button>}
        {onNext && (
          <Button
            $variant="primary"
            onClick={onNext}
            disabled={canProceed === false}
            style={canProceed === false ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            Next
          </Button>
        )}
      </Footer>
    </Harness>
  );
};

export default TestHarness;


