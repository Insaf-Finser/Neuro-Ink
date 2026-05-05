import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Brain, Activity } from 'lucide-react';
import { useDisease } from '../context/DiseaseContext';

const ToggleContainer = styled.div<{ $variant?: 'header' | 'page' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$variant === 'page' 
    ? '#f7f7fb' 
    : 'rgba(255, 255, 255, 0.12)'};
  border: ${props => props.$variant === 'page'
    ? '2px solid rgba(102, 126, 234, 0.2)'
    : '1px solid rgba(255, 255, 255, 0.18)'};
  border-radius: 12px;
  padding: 4px;
  position: relative;
  box-shadow: ${props => props.$variant === 'page'
    ? '0 4px 12px rgba(102, 126, 234, 0.15)'
    : 'none'};
`;

const ToggleButton = styled.button<{ $active: boolean; $variant?: 'header' | 'page' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => {
    if (props.$variant === 'page') {
      return props.$active 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        : 'transparent';
    }
    return props.$active 
      ? 'rgba(102, 126, 234, 0.3)' 
      : 'transparent';
  }};
  color: ${props => props.$variant === 'page' 
    ? (props.$active ? 'white' : '#666')
    : 'white'};
  font-size: ${props => props.$variant === 'page' ? '14px' : '12px'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  z-index: 1;

  &:hover {
    background: ${props => {
      if (props.$variant === 'page') {
        return props.$active 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          : 'rgba(102, 126, 234, 0.1)';
      }
      return props.$active 
        ? 'rgba(102, 126, 234, 0.4)' 
        : 'rgba(255, 255, 255, 0.1)';
    }};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToggleIndicator = styled.div<{ $position: 'left' | 'right'; $variant?: 'header' | 'page' }>`
  position: absolute;
  top: 4px;
  ${props => props.$position === 'left' ? 'left: 4px;' : 'right: 4px;'}
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: ${props => props.$variant === 'page'
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'rgba(102, 126, 234, 0.5)'};
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
  box-shadow: ${props => props.$variant === 'page'
    ? '0 2px 8px rgba(102, 126, 234, 0.4)'
    : '0 2px 8px rgba(102, 126, 234, 0.3)'};
`;

interface DiseaseToggleProps {
  variant?: 'header' | 'page';
}

const DiseaseToggle: React.FC<DiseaseToggleProps> = ({ variant = 'header' }) => {
  const { currentDisease, setDisease } = useDisease();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync disease with current route
  useEffect(() => {
    if (location.pathname === '/alzheimers' || location.pathname.startsWith('/alzheimers/')) {
      if (currentDisease !== 'alzheimers') {
        setDisease('alzheimers');
      }
    } else if (location.pathname === '/parkinsons' || location.pathname.startsWith('/parkinsons/')) {
      if (currentDisease !== 'parkinsons') {
        setDisease('parkinsons');
      }
    }
  }, [location.pathname, currentDisease, setDisease]);

  const mapPathForDisease = (targetDisease: 'alzheimers' | 'parkinsons') => {
    const path = location.pathname;

    // Awareness/home for each disease
    if (path === '/alzheimers' || path === '/parkinsons') {
      return `/${targetDisease}`;
    }

    // Tasks routes differ between diseases.
    if (
      path.startsWith('/parkinsons/tests') ||
      path.startsWith('/parkinsons/test/') ||
      path.startsWith('/parkinsons/assessment-test/')
    ) {
      return targetDisease === 'parkinsons' ? '/parkinsons/tests' : '/alzheimers/tasks';
    }
    if (
      path.startsWith('/alzheimers/tasks') ||
      path.startsWith('/alzheimers/test/') ||
      path.startsWith('/test/') ||
      path === '/tasks'
    ) {
      return targetDisease === 'parkinsons' ? '/parkinsons/tests' : '/alzheimers/tasks';
    }

    // Results routes differ too.
    if (
      path.startsWith('/parkinsons/cognitive-results') ||
      path.startsWith('/parkinsons/results') ||
      path.startsWith('/parkinsons/assessment-results')
    ) {
      return targetDisease === 'parkinsons' ? '/parkinsons/cognitive-results' : '/alzheimers/results';
    }
    if (
      path.startsWith('/alzheimers/results') ||
      path.startsWith('/results') ||
      path.startsWith('/ai-analysis') ||
      path.startsWith('/comprehensive-results')
    ) {
      return targetDisease === 'parkinsons' ? '/parkinsons/cognitive-results' : '/alzheimers/results';
    }

    // Dashboard routes
    if (
      path.startsWith('/alzheimers/dashboard') ||
      path.startsWith('/parkinsons/dashboard') ||
      path === '/dashboard'
    ) {
      return `/${targetDisease}`;
    }

    // Generic disease-prefixed path fallback
    if (path.startsWith('/alzheimers/') || path.startsWith('/parkinsons/')) {
      return path.replace(/^\/(alzheimers|parkinsons)/, `/${targetDisease}`);
    }

    return `/${targetDisease}`;
  };

  const handleToggle = (disease: 'alzheimers' | 'parkinsons') => {
    if (disease === currentDisease) return;
    
    setDisease(disease);
    localStorage.setItem('selectedDisease', disease);

    navigate(mapPathForDisease(disease));
  };

  const isAlzheimers = currentDisease === 'alzheimers';

  return (
    <ToggleContainer $variant={variant}>
      <ToggleIndicator $position={isAlzheimers ? 'left' : 'right'} $variant={variant} />
      <ToggleButton
        $active={isAlzheimers}
        $variant={variant}
        onClick={() => handleToggle('alzheimers')}
        aria-label="Switch to Alzheimer's disease"
      >
        <Brain size={16} />
        <span>Alzheimer's</span>
      </ToggleButton>
      <ToggleButton
        $active={!isAlzheimers}
        $variant={variant}
        onClick={() => handleToggle('parkinsons')}
        aria-label="Switch to Parkinson's disease"
      >
        <Activity size={16} />
        <span>Parkinson's</span>
      </ToggleButton>
    </ToggleContainer>
  );
};

export default DiseaseToggle;

