import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCcw, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';
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

const Controls = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          &:active { transform: scale(0.98); }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:active { transform: scale(0.98); }
        `;
      default:
        return `
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          &:active { transform: scale(0.98); }
        `;
    }
  }}
`;

const StatusCard = styled.div<{ $status: 'waiting' | 'drawing' | 'completed' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  background: ${props => 
    props.$status === 'completed' ? '#f0fdf4' :
    props.$status === 'drawing' ? '#fef3c7' : '#f3f4f6'
  };
  border: 2px solid ${props => 
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'drawing' ? '#f59e0b' : '#d1d5db'
  };
`;

const StatusText = styled.span<{ $status: string }>`
  font-weight: 600;
  font-size: 15px;
  color: ${props => 
    props.$status === 'completed' ? '#059669' :
    props.$status === 'drawing' ? '#d97706' : '#6b7280'
  };
`;

const Timer = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 10px;
`;

const TimerText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
`;

const PauseOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 24px 32px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  z-index: 10;
  pointer-events: none;
`;

const TextInputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #667eea;
  font-size: 18px;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  resize: vertical;
  color: #333;
  background: white;
`;

const MemorizePhaseBox = styled.div`
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
  border: 3px solid #667eea;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
`;

const WordsDisplay = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const MemorizeTimer = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #ef4444;
  margin-top: 16px;
`;

const ResultsDisplay = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 3px solid #10b981;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
`;

const ResultsText = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #059669;
  letter-spacing: 1px;
`;

const WordMemoryTest: React.FC = () => {
  const navigate = useNavigate();
  
  const [inputText, setInputText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isInMemorizePhase, setIsInMemorizePhase] = useState(true);
  const [memorizeTimeRemaining, setMemorizeTimeRemaining] = useState(30);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(90);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const WORDS_TO_REMEMBER = ['APPLE', 'CAR', 'BOOK', 'TREE', 'HOUSE'];

  const calculateScore = (text: string): number => {
    const userText = text.toUpperCase();
    let correctCount = 0;
    for (const word of WORDS_TO_REMEMBER) {
      if (userText.includes(word)) {
        correctCount++;
      }
    }
    return correctCount;
  };

  // Memorization phase timer (30 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isInMemorizePhase && memorizeTimeRemaining > 0) {
      interval = setInterval(() => {
        setMemorizeTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-start the test after 30 seconds
            setIsInMemorizePhase(false);
            setHasStarted(true);
            setTimeRemaining(90);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInMemorizePhase, memorizeTimeRemaining]);

  // Main test timer (90 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && !isSubmitted && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            // Auto-submit when time runs out
            const finalScore = calculateScore(inputText);
            setScore(finalScore);
            setIsSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, isSubmitted, timeRemaining, inputText]);

  const handleStartTest = () => {
    setIsInMemorizePhase(false);
    setHasStarted(true);
    setTimeRemaining(90);
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleTextChange = (value: string) => {
    if (isSubmitted || !hasStarted) return;
    setInputText(value);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore(inputText);
    setScore(finalScore);
    setIsSubmitted(true);
  };

  useEffect(() => {
    if (hasStarted && !isSubmitted) {
      textareaRef.current?.focus();
    }
    if (isSubmitted) {
      textareaRef.current?.blur();
    }
  }, [hasStarted, isSubmitted]);

  const clearInput = () => {
    setInputText('');
    setHasStarted(false);
    setIsInMemorizePhase(true);
    setMemorizeTimeRemaining(30);
    setTimeElapsed(0);
    setTimeRemaining(90);
    setIsSubmitted(false);
    setScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (timeRemaining === 0) return 'completed';
    if (inputText.length > 0) return 'drawing';
    return 'waiting';
  };

  const instructions = (
    <Instructions>
      <InstructionText>• Remember these 5 words: APPLE, CAR, BOOK, TREE, HOUSE</InstructionText>
      <InstructionText>• After 30 seconds, write them down from memory</InstructionText>
      <InstructionText>• Write them in any order</InstructionText>
      <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
        ⏱️ Time Limit: 90 seconds
      </InstructionText>
    </Instructions>
  );

  return (
    <Container>
      <TestHarness
        title="Word Memory Test"
        step={11}
        totalSteps={21}
        instructions={isInMemorizePhase || hasStarted ? null : instructions}
      >
        {isInMemorizePhase ? (
          <>
            <MemorizePhaseBox>
              <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#667eea' }}>
                Remember these words:
              </div>
              <WordsDisplay>
                APPLE • CAR • BOOK • TREE • HOUSE
              </WordsDisplay>
              <MemorizeTimer>
                {memorizeTimeRemaining}s
              </MemorizeTimer>
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                {memorizeTimeRemaining > 0 
                  ? 'Test will start automatically when timer ends' 
                  : 'Starting test now...'}
              </div>
            </MemorizePhaseBox>
            {memorizeTimeRemaining > 0 && (
              <Button $variant="primary" onClick={handleStartTest} style={{ width: '100%', justifyContent: 'center' }}>
                Start Test Now
              </Button>
            )}
          </>
        ) : (
          <>
            <StatusCard $status={getStatus()}>
              {getStatus() === 'completed' ? (
                <CheckCircle size={20} />
              ) : getStatus() === 'drawing' ? (
                <AlertCircle size={20} />
              ) : (
                <Clock size={20} />
              )}
              <StatusText $status={getStatus()}>
                {timeRemaining === 0 ? 'Time\'s up!' : 
                 inputText.length > 0 ? 'Writing in progress...' : 
                 hasStarted ? 'Continue writing...' : 'Ready to start'}
              </StatusText>
            </StatusCard>

            {hasStarted && !isSubmitted && (
              <Timer>
                <TimerText>
                  ⏱️ {formatTime(timeElapsed)} / Remaining: {timeRemaining !== null ? formatTime(timeRemaining) : '--'}
                </TimerText>
              </Timer>
            )}

            {isSubmitted ? (
              <ResultsDisplay>
                <ResultsText>Answered: {score}/5</ResultsText>
              </ResultsDisplay>
            ) : (
              <TextInputWrapper>
                <TextArea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={timeRemaining === 0 ? "Time's up! Test completed." : 'Type here...'}
                  disabled={isSubmitted || timeRemaining === 0 || !hasStarted}
                />
              </TextInputWrapper>
            )}

            {hasStarted && (
              <Controls>
                <Button $variant="danger" onClick={clearInput}>
                  <RotateCcw size={16} />
                  Clear
                </Button>
                {!isSubmitted && (
                  <Button $variant="primary" onClick={handleSubmit}>
                    <Send size={16} />
                    Submit
                  </Button>
                )}
              </Controls>
            )}
          </>
        )}
      </TestHarness>
    </Container>
  );
};

export default WordMemoryTest;
