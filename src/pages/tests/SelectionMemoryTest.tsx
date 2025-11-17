import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

const TestContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
`;

const TestHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const TestTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const TestSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const TestContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
`;

const PhaseContainer = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const PhaseTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const PhaseDescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 24px;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const ItemCard = styled(motion.div)<{ $selected?: boolean; $clickable?: boolean }>`
  background: ${props => props.$selected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.$selected ? 'white' : '#333'};
  border: 3px solid ${props => props.$selected ? '#667eea' : '#e8ecff'};
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  font-weight: 600;
  font-size: 1.1rem;

  ${props => props.$clickable && `
    &:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
    }
  `}
`;

const TimerContainer = styled.div`
  background: #f8f9ff;
  border: 2px solid #e8ecff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const TimerDisplay = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 16px;
`;

const TimerLabel = styled.div`
  font-size: 1.2rem;
  color: #666;
  font-weight: 600;
`;

const StatusIndicator = styled.div<{ $status: 'waiting' | 'selecting' | 'recalling' | 'completed' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => 
    props.$status === 'completed' ? '#f0fdf4' :
    props.$status === 'recalling' ? '#fef3c7' :
    props.$status === 'selecting' ? '#dbeafe' : '#f3f4f6'
  };
  border: 2px solid ${props => 
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'recalling' ? '#f59e0b' :
    props.$status === 'selecting' ? '#3b82f6' : '#d1d5db'
  };
`;

const StatusText = styled.div<{ $status: 'waiting' | 'selecting' | 'recalling' | 'completed' }>`
  font-weight: 600;
  color: ${props => 
    props.$status === 'completed' ? '#059669' :
    props.$status === 'recalling' ? '#d97706' :
    props.$status === 'selecting' ? '#1d4ed8' : '#6b7280'
  };
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 32px;
`;

const Button = styled(Link)<{ $primary?: boolean }>`
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
      background: #667eea;
      color: white;
    }
  `}
`;

const ActionButton = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
  border: none;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }
  `}
`;

const SelectionMemoryTest: React.FC = () => {
  const [phase, setPhase] = useState<'select' | 'delay' | 'recall'>('select');
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to select
  const [delayTimeLeft, setDelayTimeLeft] = useState(20); // 20 seconds delay
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [recallSelections, setRecallSelections] = useState<string[]>([]);

  const allItems = [
    'Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Cherry',
    'Lemon', 'Peach', 'Pear', 'Kiwi', 'Mango', 'Pineapple'
  ];

  const shuffledItems = [...allItems].sort(() => Math.random() - 0.5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && phase === 'select' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setPhase('delay');
            setDelayTimeLeft(20);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isTimerActive && phase === 'delay' && delayTimeLeft > 0) {
      interval = setInterval(() => {
        setDelayTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setPhase('recall');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, phase, timeLeft, delayTimeLeft]);

  const startSelection = () => {
    setIsTimerActive(true);
  };

  const startDelay = () => {
    setIsTimerActive(true);
  };

  const handleItemSelect = (item: string) => {
    if (phase !== 'select' || selectedItems.length >= 4) return;
    
    if (selectedItems.includes(item)) {
      setSelectedItems(prev => prev.filter(i => i !== item));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const handleRecallSelect = (item: string) => {
    if (phase !== 'recall') return;
    
    if (recallSelections.includes(item)) {
      setRecallSelections(prev => prev.filter(i => i !== item));
    } else {
      setRecallSelections(prev => [...prev, item]);
    }
  };

  const getStatus = () => {
    switch (phase) {
      case 'select':
        return isTimerActive ? 'selecting' : 'waiting';
      case 'delay':
        return 'selecting';
      case 'recall':
        return 'recalling';
      default:
        return 'completed';
    }
  };

  const getStatusText = () => {
    switch (phase) {
      case 'select':
        return isTimerActive ? 'Selecting items...' : 'Ready to start selection';
      case 'delay':
        return 'Delay period - preparing for recall';
      case 'recall':
        return 'Now select the same items you chose before';
      default:
        return 'Test completed';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    selectedItems.forEach(item => {
      if (recallSelections.includes(item)) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <TestContainer>
      <div className="container">
        <TestHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TestTitle>Selection Memory Test</TestTitle>
            <TestSubtitle>
              This test evaluates attention, working memory, and recognition abilities
            </TestSubtitle>
          </motion.div>
        </TestHeader>

        <TestContent>
          <StatusIndicator $status={getStatus()}>
            {getStatus() === 'completed' ? (
              <CheckCircle size={20} />
            ) : getStatus() === 'recalling' ? (
              <Play size={20} />
            ) : getStatus() === 'selecting' ? (
              <Clock size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <StatusText $status={getStatus()}>
              {getStatusText()}
            </StatusText>
          </StatusIndicator>

          {phase === 'select' && (
            <PhaseContainer>
              <PhaseTitle>Selection Phase</PhaseTitle>
              <PhaseDescription>
                Click on exactly 4 items from the list below. You have 30 seconds to make your selections.
              </PhaseDescription>
              
              <ItemGrid>
                {allItems.map((item, index) => (
                  <ItemCard
                    key={item}
                    $selected={selectedItems.includes(item)}
                    $clickable={true}
                    onClick={() => handleItemSelect(item)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    {item}
                  </ItemCard>
                ))}
              </ItemGrid>

              <div style={{ marginBottom: '24px', fontSize: '1.1rem', color: '#666' }}>
                Selected: {selectedItems.length}/4 items
              </div>

              <TimerContainer>
                <TimerDisplay>{formatTime(timeLeft)}</TimerDisplay>
                <TimerLabel>Time remaining to select items</TimerLabel>
              </TimerContainer>

              {!isTimerActive && timeLeft === 30 && (
                <ActionButton $primary={true} onClick={startSelection}>
                  <Play size={20} />
                  Start Selection
                </ActionButton>
              )}
            </PhaseContainer>
          )}

          {phase === 'delay' && (
            <PhaseContainer>
              <PhaseTitle>Delay Phase</PhaseTitle>
              <PhaseDescription>
                Please wait while we prepare the recall phase. The items will be rearranged.
              </PhaseDescription>
              
              <TimerContainer>
                <TimerDisplay>{formatTime(delayTimeLeft)}</TimerDisplay>
                <TimerLabel>Delay period</TimerLabel>
              </TimerContainer>

              {!isTimerActive && delayTimeLeft === 20 && (
                <ActionButton $primary={true} onClick={startDelay}>
                  <Play size={20} />
                  Start Delay Period
                </ActionButton>
              )}
            </PhaseContainer>
          )}

          {phase === 'recall' && (
            <PhaseContainer>
              <PhaseTitle>Recall Phase</PhaseTitle>
              <PhaseDescription>
                Now select the same 4 items you chose in the first phase. The items have been rearranged.
              </PhaseDescription>
              
              <ItemGrid>
                {shuffledItems.map((item, index) => (
                  <ItemCard
                    key={item}
                    $selected={recallSelections.includes(item)}
                    $clickable={true}
                    onClick={() => handleRecallSelect(item)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    {item}
                  </ItemCard>
                ))}
              </ItemGrid>

              <div style={{ marginBottom: '24px', fontSize: '1.1rem', color: '#666' }}>
                Selected: {recallSelections.length}/4 items
              </div>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  Score: {calculateScore()}/4 items correctly recalled
                </p>
              </div>
            </PhaseContainer>
          )}

          <ButtonContainer>
            <Button to="/test/image-association" $primary={false}>
              <ArrowLeft size={20} />
              Previous Test
            </Button>
            {phase === 'recall' && (
              <Button to="/results" $primary={true}>
                View Results
                <ArrowRight size={20} />
              </Button>
            )}
          </ButtonContainer>
        </TestContent>
      </div>
    </TestContainer>
  );
};

export default SelectionMemoryTest;
