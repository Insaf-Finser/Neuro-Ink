// Task Completion Button Component
// Provides a standardized completion button for all handwriting tasks

import React from 'react';
import styled from 'styled-components';
import { CheckCircle, Loader2 } from 'lucide-react';

interface TaskCompletionButtonProps {
  isCompleting: boolean;
  hasStrokes: boolean;
  onComplete: () => void;
  disabled?: boolean;
  className?: string;
}

const CompletionButton = styled.button<{ $isCompleting: boolean; $hasStrokes: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;

  ${props => {
    if (props.$isCompleting) {
      return `
        background: #6b7280;
        color: white;
        cursor: not-allowed;
      `;
    }
    
    if (!props.$hasStrokes) {
      return `
        background: #9ca3af;
        color: white;
        cursor: not-allowed;
      `;
    }
    
    return `
      background: #10b981;
      color: white;
      &:hover {
        background: #059669;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
      }
    `;
  }}
`;

const TaskCompletionButton: React.FC<TaskCompletionButtonProps> = ({
  isCompleting,
  hasStrokes,
  onComplete,
  disabled = false,
  className
}) => {
  return (
    <CompletionButton
      $isCompleting={isCompleting}
      $hasStrokes={hasStrokes}
      onClick={onComplete}
      disabled={disabled || isCompleting || !hasStrokes}
      className={className}
    >
      {isCompleting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Completing...
        </>
      ) : (
        <>
          <CheckCircle size={16} />
          Complete Task
        </>
      )}
    </CompletionButton>
  );
};

export default TaskCompletionButton;
