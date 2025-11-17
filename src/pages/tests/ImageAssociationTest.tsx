import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Image, 
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

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const ImageCard = styled(motion.div)`
  background: white;
  border: 3px solid #e8ecff;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  }
`;

const ImagePlaceholder = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
`;

const ImageLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const ImageNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #667eea;
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

const RecallGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const RecallCard = styled(motion.div)`
  background: white;
  border: 3px solid #e8ecff;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
`;

const RecallImagePlaceholder = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
`;

const RecallInput = styled.input`
  width: 60px;
  height: 40px;
  border: 2px solid #e8ecff;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  margin-top: 12px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const StatusIndicator = styled.div<{ $status: 'waiting' | 'learning' | 'recalling' | 'completed' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => 
    props.$status === 'completed' ? '#f0fdf4' :
    props.$status === 'recalling' ? '#fef3c7' :
    props.$status === 'learning' ? '#dbeafe' : '#f3f4f6'
  };
  border: 2px solid ${props => 
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'recalling' ? '#f59e0b' :
    props.$status === 'learning' ? '#3b82f6' : '#d1d5db'
  };
`;

const StatusText = styled.div<{ $status: 'waiting' | 'learning' | 'recalling' | 'completed' }>`
  font-weight: 600;
  color: ${props => 
    props.$status === 'completed' ? '#059669' :
    props.$status === 'recalling' ? '#d97706' :
    props.$status === 'learning' ? '#1d4ed8' : '#6b7280'
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

const ImageAssociationTest: React.FC = () => {
  const [phase, setPhase] = useState<'learn' | 'delay' | 'recall'>('learn');
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds to learn
  const [delayTimeLeft, setDelayTimeLeft] = useState(30); // 30 seconds delay
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [recallAnswers, setRecallAnswers] = useState<{ [key: string]: string }>({});

  const imageAssociations = [
    { image: '🏠', number: '7', id: 'house' },
    { image: '🌳', number: '3', id: 'tree' },
    { image: '🚗', number: '9', id: 'car' },
    { image: '⭐', number: '1', id: 'star' },
    { image: '🐱', number: '5', id: 'cat' },
    { image: '📚', number: '2', id: 'book' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && phase === 'learn' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setPhase('delay');
            setDelayTimeLeft(30);
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

  const startLearning = () => {
    setIsTimerActive(true);
  };

  const startDelay = () => {
    setIsTimerActive(true);
  };

  const handleRecallChange = (imageId: string, value: string) => {
    setRecallAnswers(prev => ({
      ...prev,
      [imageId]: value
    }));
  };

  const getStatus = () => {
    switch (phase) {
      case 'learn':
        return isTimerActive ? 'learning' : 'waiting';
      case 'delay':
        return 'learning';
      case 'recall':
        return 'recalling';
      default:
        return 'completed';
    }
  };

  const getStatusText = () => {
    switch (phase) {
      case 'learn':
        return isTimerActive ? 'Learning associations...' : 'Ready to start learning';
      case 'delay':
        return 'Delay period - preparing for recall';
      case 'recall':
        return 'Now recall the numbers for each image';
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
    imageAssociations.forEach(association => {
      if (recallAnswers[association.id] === association.number) {
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
            <TestTitle>Image Association Test</TestTitle>
            <TestSubtitle>
              This test evaluates visual memory and associative learning abilities
            </TestSubtitle>
          </motion.div>
        </TestHeader>

        <TestContent>
          <StatusIndicator $status={getStatus()}>
            {getStatus() === 'completed' ? (
              <CheckCircle size={20} />
            ) : getStatus() === 'recalling' ? (
              <Play size={20} />
            ) : getStatus() === 'learning' ? (
              <Clock size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <StatusText $status={getStatus()}>
              {getStatusText()}
            </StatusText>
          </StatusIndicator>

          {phase === 'learn' && (
            <PhaseContainer>
              <PhaseTitle>Learning Phase</PhaseTitle>
              <PhaseDescription>
                Study the following image-number associations carefully. You have 90 seconds to memorize them.
              </PhaseDescription>
              
              <ImageGrid>
                {imageAssociations.map((association, index) => (
                  <ImageCard
                    key={association.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ImagePlaceholder>
                      {association.image}
                    </ImagePlaceholder>
                    <ImageLabel>Image {index + 1}</ImageLabel>
                    <ImageNumber>{association.number}</ImageNumber>
                  </ImageCard>
                ))}
              </ImageGrid>

              <TimerContainer>
                <TimerDisplay>{formatTime(timeLeft)}</TimerDisplay>
                <TimerLabel>Time remaining to learn associations</TimerLabel>
              </TimerContainer>

              {!isTimerActive && timeLeft === 90 && (
                <ActionButton $primary={true} onClick={startLearning}>
                  <Play size={20} />
                  Start Learning
                </ActionButton>
              )}
            </PhaseContainer>
          )}

          {phase === 'delay' && (
            <PhaseContainer>
              <PhaseTitle>Delay Phase</PhaseTitle>
              <PhaseDescription>
                Please wait while we prepare the recall phase. Do not write anything yet.
              </PhaseDescription>
              
              <TimerContainer>
                <TimerDisplay>{formatTime(delayTimeLeft)}</TimerDisplay>
                <TimerLabel>Delay period</TimerLabel>
              </TimerContainer>

              {!isTimerActive && delayTimeLeft === 30 && (
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
                Now enter the number that was associated with each image during the learning phase.
              </PhaseDescription>
              
              <RecallGrid>
                {imageAssociations.map((association, index) => (
                  <RecallCard
                    key={association.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <RecallImagePlaceholder>
                      {association.image}
                    </RecallImagePlaceholder>
                    <div style={{ marginBottom: '12px', fontWeight: '600', color: '#333' }}>
                      Image {index + 1}
                    </div>
                    <RecallInput
                      type="text"
                      value={recallAnswers[association.id] || ''}
                      onChange={(e) => handleRecallChange(association.id, e.target.value)}
                      placeholder="?"
                      maxLength={2}
                    />
                  </RecallCard>
                ))}
              </RecallGrid>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  Score: {calculateScore()}/6 associations recalled correctly
                </p>
              </div>
            </PhaseContainer>
          )}

          <ButtonContainer>
            <Button to="/test/word-recall" $primary={false}>
              <ArrowLeft size={20} />
              Previous Test
            </Button>
            {phase === 'recall' && (
              <Button to="/test/selection-memory" $primary={true}>
                Next Test
                <ArrowRight size={20} />
              </Button>
            )}
          </ButtonContainer>
        </TestContent>
      </div>
    </TestContainer>
  );
};

export default ImageAssociationTest;
