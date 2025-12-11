import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, AlertCircle } from 'lucide-react';
import TestHarness from '../../components/TestHarness';

const Container = styled.div`
  padding: 16px 0;
`;

const Instructions = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  color: #92400e;
`;

const InstructionText = styled.p`
  margin: 8px 0;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.6;
`;

const StatusCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  background: #f3f4f6;
  border: 2px solid #d1d5db;
`;

const StatusText = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: #6b7280;
`;

const WordRecallTest: React.FC = () => {
  const navigate = useNavigate();

  const instructions = (
    <Instructions>
      <InstructionText>• Memorize a list of words</InstructionText>
      <InstructionText>• Recall them after a delay</InstructionText>
      <InstructionText>• This test evaluates verbal memory and recall</InstructionText>
    </Instructions>
  );

  return (
    <Container>
      <TestHarness
        title="Word Recall Test"
        step={21}
        totalSteps={21}
        instructions={instructions}
        isComplete
        onNext={() => navigate('/tasks')}
        canProceed
      >
        <StatusCard>
          <AlertCircle size={20} />
          <StatusText>Test implementation in progress</StatusText>
        </StatusCard>
      </TestHarness>
    </Container>
  );
};

export default WordRecallTest;


