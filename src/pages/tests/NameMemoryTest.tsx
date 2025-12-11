import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCcw, Play, Pause, CheckCircle, AlertCircle, Clock, Delete } from 'lucide-react';
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

const TextDisplay = styled.div`
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px;
  min-height: 200px;
  font-size: 18px;
  word-wrap: break-word;
  line-height: 1.6;
  margin-bottom: 16px;
  position: relative;
  font-family: 'Courier New', monospace;
  color: #333;
`;

const KeyboardContainer = styled.div`
  background: #f3f4f6;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  padding: 12px;
`;

const KeyboardRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  justify-content: center;
  flex-wrap: wrap;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Key = styled.button<{ $size?: 'normal' | 'large' | 'small' }>`
  padding: ${props => {
    switch (props.$size) {
      case 'large':
        return '12px 16px';
      case 'small':
        return '8px 6px';
      default:
        return '10px 12px';
    }
  }};
  border: 1px solid #9ca3af;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: ${props => {
    switch (props.$size) {
      case 'small':
        return '32px';
      default:
        return '40px';
    }
  }};
  
  &:active {
    background: #667eea;
    color: white;
    transform: scale(0.95);
  }

  &:hover {
    background: #e5e7eb;
  }
`;

const NameMemoryTest: React.FC = () => {
  const navigate = useNavigate();
  
  const [inputText, setInputText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(90);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && !isPaused && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            setIsPaused(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, isPaused, timeRemaining]);

  // Handle task completion
  useEffect(() => {
    if (timeRemaining === 0 && hasStarted) {
      // Task completed - timer ran out
      setIsPaused(true);
    }
  }, [timeRemaining, hasStarted]);

  const handleStartTest = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setTimeRemaining(90);
      setIsPaused(false);
    }
  };

  const handleKeyPress = (char: string) => {
    if (isPaused || !hasStarted) return;
    setInputText(prev => prev + char);
  };

  const handleSpace = () => {
    if (isPaused || !hasStarted) return;
    setInputText(prev => prev + ' ');
  };

  const handleBackspace = () => {
    if (isPaused || !hasStarted) return;
    setInputText(prev => prev.slice(0, -1));
  };

  const handleEnter = () => {
    if (isPaused || !hasStarted) return;
    setInputText(prev => prev + '\n');
  };

  const clearInput = () => {
    setInputText('');
    setHasStarted(false);
    setTimeElapsed(0);
    setTimeRemaining(90);
    setIsPaused(false);
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
      <InstructionText>• Remember these names: JOHN, MARY, DAVID, SARAH, MICHAEL</InstructionText>
      <InstructionText>• After 30 seconds, write them from memory</InstructionText>
      <InstructionText>• Write them in any order</InstructionText>
      <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
        ⏱️ Time Limit: 90 seconds
      </InstructionText>
    </Instructions>
  );

  return (
    <Container>
      <TestHarness
        title="Name Memory Test"
        step={14}
        totalSteps={21}
        instructions={instructions}
        onQuit={() => navigate('/tasks')}
        onPause={() => setIsPaused(prev => !prev)}
      >
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
            {isPaused && ' (Paused)'}
          </StatusText>
        </StatusCard>

        {hasStarted && (
          <Timer>
            <TimerText>
              ⏱️ {formatTime(timeElapsed)} / Remaining: {timeRemaining !== null ? formatTime(timeRemaining) : '--'}
            </TimerText>
          </Timer>
        )}

        {!hasStarted ? (
          <Button $variant="primary" onClick={handleStartTest} style={{ width: '100%', justifyContent: 'center' }}>
            Start Test
          </Button>
        ) : (
          <TextInputWrapper>
            <TextDisplay>
              {inputText}
              {!isPaused && hasStarted && timeRemaining !== 0 && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
            </TextDisplay>

            <KeyboardContainer>
              <KeyboardRow>
                <Key $size="small" onClick={() => handleKeyPress('Q')}>Q</Key>
                <Key $size="small" onClick={() => handleKeyPress('W')}>W</Key>
                <Key $size="small" onClick={() => handleKeyPress('E')}>E</Key>
                <Key $size="small" onClick={() => handleKeyPress('R')}>R</Key>
                <Key $size="small" onClick={() => handleKeyPress('T')}>T</Key>
                <Key $size="small" onClick={() => handleKeyPress('Y')}>Y</Key>
                <Key $size="small" onClick={() => handleKeyPress('U')}>U</Key>
                <Key $size="small" onClick={() => handleKeyPress('I')}>I</Key>
                <Key $size="small" onClick={() => handleKeyPress('O')}>O</Key>
                <Key $size="small" onClick={() => handleKeyPress('P')}>P</Key>
              </KeyboardRow>

              <KeyboardRow>
                <Key $size="small" onClick={() => handleKeyPress('A')}>A</Key>
                <Key $size="small" onClick={() => handleKeyPress('S')}>S</Key>
                <Key $size="small" onClick={() => handleKeyPress('D')}>D</Key>
                <Key $size="small" onClick={() => handleKeyPress('F')}>F</Key>
                <Key $size="small" onClick={() => handleKeyPress('G')}>G</Key>
                <Key $size="small" onClick={() => handleKeyPress('H')}>H</Key>
                <Key $size="small" onClick={() => handleKeyPress('J')}>J</Key>
                <Key $size="small" onClick={() => handleKeyPress('K')}>K</Key>
                <Key $size="small" onClick={() => handleKeyPress('L')}>L</Key>
              </KeyboardRow>

              <KeyboardRow>
                <Key $size="small" onClick={() => handleKeyPress('Z')}>Z</Key>
                <Key $size="small" onClick={() => handleKeyPress('X')}>X</Key>
                <Key $size="small" onClick={() => handleKeyPress('C')}>C</Key>
                <Key $size="small" onClick={() => handleKeyPress('V')}>V</Key>
                <Key $size="small" onClick={() => handleKeyPress('B')}>B</Key>
                <Key $size="small" onClick={() => handleKeyPress('N')}>N</Key>
                <Key $size="small" onClick={() => handleKeyPress('M')}>M</Key>
              </KeyboardRow>

              <KeyboardRow>
                <Key $size="large" onClick={handleSpace}>Space</Key>
                <Key $size="large" onClick={handleEnter}>Enter</Key>
                <Key $size="large" onClick={handleBackspace}>
                  <Delete size={14} />
                </Key>
              </KeyboardRow>
            </KeyboardContainer>
          </TextInputWrapper>
        )}

        {hasStarted && (
          <Controls>
            <Button $variant="danger" onClick={clearInput}>
              <RotateCcw size={16} />
              Clear
            </Button>
            {timeRemaining !== 0 && (
              <Button $variant="secondary" onClick={() => setIsPaused(prev => !prev)}>
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
          </Controls>
        )}
      </TestHarness>
    </Container>
  );
};

export default NameMemoryTest;
