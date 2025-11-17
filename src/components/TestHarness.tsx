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
  font-weight: 600;
  color: #667eea;
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
  onPause?: () => void;
  onQuit?: () => void;
}

const TestHarness: React.FC<TestHarnessProps> = ({
  title,
  step,
  totalSteps,
  instructions,
  children,
  onPause,
  onQuit
}) => {
  return (
    <Harness>
      <Header>
        <Title>{title}</Title>
        <Progress>
          Step {step} / {totalSteps}
        </Progress>
      </Header>
      <Instructions>{instructions}</Instructions>
      {children}
      <Footer>
        {onQuit && <Button onClick={onQuit}>Quit</Button>}
        {onPause && <Button $variant="secondary" onClick={onPause}>Pause</Button>}
      </Footer>
    </Harness>
  );
};

export default TestHarness;


