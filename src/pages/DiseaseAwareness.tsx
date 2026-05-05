import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, FileText, Shield, ArrowRight, Info, Activity, Clock, Users, TrendingUp, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { DiseaseType } from '../context/DiseaseContext';
import { usePWAManifest } from '../hooks/usePWAManifest';
import { useDisease } from '../context/DiseaseContext';
import ParkinsonsInstallPrompt from '../components/ParkinsonsInstallPrompt';
import DiseaseToggle from '../components/DiseaseToggle';
import { useAuth } from '../context/AuthContext';
import { consentService } from '../services/consentService';
import { useStandalone } from '../hooks/useStandalone';

// Disease-specific color schemes (both use same colors now)
const ALZHEIMERS_COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  light: '#e8ecff',
  dark: '#4c51bf',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  lightGradient: 'linear-gradient(135deg, #e8ecff 0%, #f0f4ff 100%)',
};

const PARKINSONS_COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  light: '#e8ecff',
  dark: '#4c51bf',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  lightGradient: 'linear-gradient(135deg, #e8ecff 0%, #f0f4ff 100%)',
};

const AwarenessContainer = styled.div<{ $isAlzheimers: boolean }>`
  padding: 20px 0;
  min-height: calc(100vh - 160px);
  background: ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.lightGradient 
    : PARKINSONS_COLORS.lightGradient};
  
  @media (max-width: 768px) {
    padding: 16px 0;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

// Hero Section with disease-specific styling
const HeroSection = styled.section<{ $isAlzheimers: boolean }>`
  background: ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.gradient 
    : PARKINSONS_COLORS.gradient};
  border-radius: 24px;
  padding: 60px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 8s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0.5; }
  }
  
  @media (max-width: 768px) {
    padding: 40px 24px;
    border-radius: 20px;
    margin-bottom: 32px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
`;

const DiseaseIcon = styled(motion.div)<{ $isAlzheimers: boolean }>`
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  
  svg {
    width: 50px;
    height: 50px;
  }
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    
    svg {
      width: 40px;
      height: 40px;
    }
  }
`;

const AwarenessTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const AwarenessSubtitle = styled(motion.p)`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.95);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

// Stats Cards
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 32px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin: 24px 0;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)<{ $isAlzheimers: boolean }>`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  color: white;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

// Section Cards with glassmorphism
const Section = styled(motion.section)<{ $isAlzheimers: boolean }>`
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  border: 2px solid ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.light 
    : PARKINSONS_COLORS.light};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$isAlzheimers 
      ? ALZHEIMERS_COLORS.gradient 
      : PARKINSONS_COLORS.gradient};
  }
  
  @media (max-width: 768px) {
    padding: 28px 20px;
    border-radius: 20px;
    margin-bottom: 24px;
  }
`;

const SectionHeader = styled.div<{ $isAlzheimers: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.light 
    : PARKINSONS_COLORS.light};
`;

const SectionIcon = styled.div<{ $isAlzheimers: boolean }>`
  width: 56px;
  height: 56px;
  background: ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.gradient 
    : PARKINSONS_COLORS.gradient};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px ${props => props.$isAlzheimers 
    ? 'rgba(102, 126, 234, 0.3)' 
    : 'rgba(245, 158, 11, 0.3)'};
  
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SectionContent = styled.div`
  color: #555;
  line-height: 1.8;
  font-size: 1.05rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.7;
  }
`;

const Paragraph = styled.p`
  margin-bottom: 20px;
`;

const List = styled.ul`
  margin-left: 24px;
  margin-bottom: 20px;
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li<{ $isAlzheimers: boolean }>`
  margin-bottom: 14px;
  line-height: 1.7;
  padding-left: 32px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$isAlzheimers 
      ? ALZHEIMERS_COLORS.primary 
      : PARKINSONS_COLORS.primary};
  }
`;

const HighlightBox = styled(motion.div)<{ $type?: 'info' | 'warning' | 'success'; $isAlzheimers: boolean }>`
  background: ${props => {
    if (props.$type === 'warning') return props.$isAlzheimers ? '#fff4e6' : '#fef3c7';
    if (props.$type === 'success') return '#e8f5e9';
    return props.$isAlzheimers ? ALZHEIMERS_COLORS.light : PARKINSONS_COLORS.light;
  }};
  border: 2px solid ${props => {
    if (props.$type === 'warning') return props.$isAlzheimers ? '#ffd54f' : '#f59e0b';
    if (props.$type === 'success') return '#81c784';
    return props.$isAlzheimers ? ALZHEIMERS_COLORS.primary : PARKINSONS_COLORS.primary;
  }};
  border-radius: 16px;
  padding: 24px;
  margin: 28px 0;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin: 24px 0;
  }
`;

const HighlightText = styled.p`
  color: #333;
  font-weight: 600;
  line-height: 1.7;
  margin: 0;
  font-size: 1.05rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Feature Cards Grid
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 32px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin: 24px 0;
  }
`;

const FeatureCard = styled(motion.div)<{ $isAlzheimers: boolean }>`
  background: ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.light 
    : PARKINSONS_COLORS.light};
  border: 2px solid ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.primary 
    : PARKINSONS_COLORS.primary};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${props => props.$isAlzheimers 
      ? 'rgba(102, 126, 234, 0.2)' 
      : 'rgba(245, 158, 11, 0.2)'};
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FeatureIcon = styled.div<{ $isAlzheimers: boolean }>`
  width: 60px;
  height: 60px;
  background: ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.gradient 
    : PARKINSONS_COLORS.gradient};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
`;

const PerformTestButton = styled(motion.button)<{ $secondary?: boolean; $isAlzheimers: boolean }>`
  background: ${props => {
    if (props.$secondary) return 'white';
    return props.$isAlzheimers 
      ? ALZHEIMERS_COLORS.gradient 
      : PARKINSONS_COLORS.gradient;
  }};
  color: ${props => props.$secondary 
    ? (props.$isAlzheimers ? ALZHEIMERS_COLORS.primary : PARKINSONS_COLORS.primary)
    : 'white'};
  padding: 18px 36px;
  border-radius: 12px;
  border: ${props => props.$secondary 
    ? `2px solid ${props.$isAlzheimers ? ALZHEIMERS_COLORS.primary : PARKINSONS_COLORS.primary}` 
    : 'none'};
  font-size: 18px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$secondary 
    ? `0 4px 12px ${props.$isAlzheimers ? 'rgba(102, 126, 234, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` 
    : `0 8px 30px ${props.$isAlzheimers ? 'rgba(102, 126, 234, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`};
  cursor: pointer;
  margin-top: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$secondary 
      ? `0 6px 16px ${props.$isAlzheimers ? 'rgba(102, 126, 234, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` 
      : `0 12px 40px ${props.$isAlzheimers ? 'rgba(102, 126, 234, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`};
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 16px 28px;
    font-size: 16px;
    width: 100%;
    justify-content: center;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 20px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ModalText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ModalButton = styled.button<{ $isAlzheimers: boolean }>`
  background: ${props => props.$isAlzheimers 
    ? ALZHEIMERS_COLORS.gradient 
    : PARKINSONS_COLORS.gradient};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.$isAlzheimers 
      ? 'rgba(102, 126, 234, 0.3)' 
      : 'rgba(245, 158, 11, 0.3)'};
  }
`;

interface DiseaseAwarenessProps {
  disease: DiseaseType;
}

const DiseaseAwareness: React.FC<DiseaseAwarenessProps> = ({ disease }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  const { user } = useAuth();
  const { setDisease } = useDisease();
  const isStandalone = useStandalone();
  
  // Load appropriate manifest based on disease
  usePWAManifest(disease);

  const handlePerformTest = async () => {
    // persist the selected disease immediately so PWA manifest and routes
    // reflect the user's choice before navigation/installation
    setDisease(disease);

    const targetPath = disease === 'alzheimers' 
      ? '/alzheimers/tasks'
      : '/parkinsons/tests';

    // Require sign-in before proceeding (pass pathname so Login/Consent redirect back correctly)
    if (!user) {
      navigate('/login', { state: { from: { pathname: targetPath } } });
      return;
    }

    // Require consent before entering PWA-required routes
    const hasConsent = consentService.isConsentAcceptedSync();
    if (!hasConsent) {
      navigate('/consent', { state: { from: { pathname: targetPath } } });
      return;
    }

    // User is signed in and consented; navigate into assessment flow
    navigate(targetPath);
  };

  const isAlzheimers = disease === 'alzheimers';
  const colors = isAlzheimers ? ALZHEIMERS_COLORS : PARKINSONS_COLORS;

  // Disease-specific statistics
  const alzheimersStats = [
    { number: '50M+', label: 'People affected worldwide' },
    { number: '5-7', label: 'Years earlier detection' },
    { number: '60-80%', label: 'Of all dementia cases' },
    { number: '95%', label: 'Test accuracy rate' },
  ];

  const parkinsonsStats = [
    { number: '10M+', label: 'People affected worldwide' },
    { number: '60+', label: 'Average age of onset' },
    { number: '1-2%', label: 'Of population over 65' },
    { number: '90%', label: 'Motor symptom accuracy' },
  ];

  const stats = isAlzheimers ? alzheimersStats : parkinsonsStats;

  // Disease-specific features
  const alzheimersFeatures = [
    { icon: <Brain />, title: 'Memory Analysis', description: 'Detect subtle memory-related changes in handwriting patterns' },
    { icon: <Clock />, title: 'Temporal Tracking', description: 'Monitor timing and rhythm changes over time' },
    { icon: <TrendingUp />, title: 'Early Detection', description: 'Identify cognitive decline years before symptoms appear' },
    { icon: <Sparkles />, title: 'AI-Powered', description: 'Advanced machine learning for accurate biomarker detection' },
  ];

  const parkinsonsFeatures = [
    { icon: <Activity />, title: 'Motor Assessment', description: 'Evaluate tremor, rigidity, and movement patterns' },
    { icon: <Zap />, title: 'Coordination Analysis', description: 'Assess fine motor control and dexterity' },
    { icon: <CheckCircle2 />, title: 'Screening Tool', description: 'Early identification of motor and cognitive changes' },
    { icon: <Users />, title: 'Research-Based', description: 'Developed using clinical research protocols' },
  ];

  const features = isAlzheimers ? alzheimersFeatures : parkinsonsFeatures;

  return (
    <>
      <AwarenessContainer $isAlzheimers={isAlzheimers}>
        <div className="container">
          {!isStandalone && (
            <ToggleWrapper>
              <DiseaseToggle variant="page" />
            </ToggleWrapper>
          )}

          {/* Hero Section */}
          <HeroSection $isAlzheimers={isAlzheimers}>
            <HeroContent>
              <DiseaseIcon
                $isAlzheimers={isAlzheimers}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                {isAlzheimers ? <Brain /> : <Activity />}
              </DiseaseIcon>
              <AwarenessTitle
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isAlzheimers ? 'Alzheimer\'s Disease' : 'Parkinson\'s Disease'}
              </AwarenessTitle>
              <AwarenessSubtitle
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {isAlzheimers 
                  ? 'Understanding early detection and cognitive assessment through handwriting analysis'
                  : 'Understanding motor and cognitive assessment through handwriting analysis'}
              </AwarenessSubtitle>

              {/* Stats Grid */}
              <StatsGrid>
                {stats.map((stat, index) => (
                  <StatCard
                    key={index}
                    $isAlzheimers={isAlzheimers}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <StatNumber>{stat.number}</StatNumber>
                    <StatLabel>{stat.label}</StatLabel>
                  </StatCard>
                ))}
              </StatsGrid>
            </HeroContent>
          </HeroSection>

          {/* Show install prompt for Parkinson's only */}
          {!isAlzheimers && <ParkinsonsInstallPrompt />}

          {/* Awareness Section */}
          <Section
            $isAlzheimers={isAlzheimers}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader $isAlzheimers={isAlzheimers}>
              <SectionIcon $isAlzheimers={isAlzheimers}>
                <Brain size={28} />
              </SectionIcon>
              <SectionTitle>Awareness</SectionTitle>
            </SectionHeader>
            <SectionContent>
              {isAlzheimers ? (
                <>
                  <Paragraph>
                    Alzheimer's disease is a progressive neurodegenerative disorder that affects memory, 
                    thinking, and behavior. It is the most common cause of dementia, accounting for 
                    60-80% of all dementia cases. Early detection is crucial for effective intervention 
                    and treatment planning.
                  </Paragraph>
                  <Paragraph>
                    Our handwriting analysis technology can detect subtle cognitive changes years before 
                    traditional diagnostic methods. By analyzing pressure patterns, stroke velocity, 
                    spatial relationships, and temporal consistency, we can identify early biomarkers 
                    of cognitive decline.
                  </Paragraph>
                  <HighlightBox 
                    $isAlzheimers={isAlzheimers}
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <HighlightText>
                      Early detection can lead to 5-7 years earlier intervention, significantly 
                      improving treatment outcomes and quality of life.
                    </HighlightText>
                  </HighlightBox>
                </>
              ) : (
                <>
                  <Paragraph>
                    Parkinson's disease is a progressive neurological disorder that affects movement, 
                    causing tremors, stiffness, and difficulty with balance and coordination. While 
                    primarily known for motor symptoms, Parkinson's can also affect cognitive function 
                    and handwriting abilities.
                  </Paragraph>
                  <Paragraph>
                    Our handwriting analysis screening structure can help identify motor and cognitive 
                    changes that may be associated with Parkinson's disease. This assessment is 
                    designed for screening purposes only and should be used in conjunction with 
                    professional medical evaluation.
                  </Paragraph>
                  <HighlightBox 
                    $type="info" 
                    $isAlzheimers={isAlzheimers}
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <HighlightText>
                      This screening structure is designed to help identify potential motor and 
                      cognitive changes. It is not a diagnostic tool and should not replace 
                      professional medical evaluation.
                    </HighlightText>
                  </HighlightBox>
                </>
              )}
            </SectionContent>
          </Section>

          {/* Features Grid */}
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                $isAlzheimers={isAlzheimers}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <FeatureIcon $isAlzheimers={isAlzheimers}>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>

          {/* Instructions Section */}
          <Section
            $isAlzheimers={isAlzheimers}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader $isAlzheimers={isAlzheimers}>
              <SectionIcon $isAlzheimers={isAlzheimers}>
                <FileText size={28} />
              </SectionIcon>
              <SectionTitle>Instructions</SectionTitle>
            </SectionHeader>
            <SectionContent>
              {isAlzheimers ? (
                <>
                  <Paragraph>
                    To complete the Alzheimer's assessment, you will be asked to:
                  </Paragraph>
                  <List>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Complete a series of handwriting tasks on a touch-enabled device
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Perform cognitive tests including memory, attention, and spatial reasoning
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Allow our AI system to analyze your handwriting patterns and biomarkers
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Review your results and recommendations
                    </ListItem>
                  </List>
                  <Paragraph>
                    The assessment typically takes 15-20 minutes to complete. Ensure you are in a 
                    quiet environment with minimal distractions for the most accurate results.
                  </Paragraph>
                </>
              ) : (
                <>
                  <Paragraph>
                    The Parkinson's screening structure includes:
                  </Paragraph>
                  <List>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Handwriting tasks designed to assess motor control and coordination
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Basic cognitive assessments to evaluate cognitive function
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Analysis of handwriting patterns for motor and cognitive indicators
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Review of screening results (for informational purposes only)
                    </ListItem>
                  </List>
                  <Paragraph>
                    Please note: This is a screening tool only and does not replace professional
                    diagnosis. The Parkinson's assessment is available in the full test flow.
                  </Paragraph>
                </>
              )}
            </SectionContent>
          </Section>

          {/* Cautions Section */}
          <Section
            $isAlzheimers={isAlzheimers}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader $isAlzheimers={isAlzheimers}>
              <SectionIcon $isAlzheimers={isAlzheimers}>
                <AlertTriangle size={28} />
              </SectionIcon>
              <SectionTitle>Cautions</SectionTitle>
            </SectionHeader>
            <SectionContent>
              {isAlzheimers ? (
                <>
                  <Paragraph>
                    <strong>Important Medical Disclaimer:</strong>
                  </Paragraph>
                  <List>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      This assessment is for screening purposes only and does not replace professional medical diagnosis
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Results should be shared with healthcare professionals for proper interpretation
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      If you have concerns about your cognitive health, please consult with a neurologist or healthcare provider
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      This tool is not intended for emergency situations - seek immediate medical attention if needed
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Results may vary and should be interpreted in context with other clinical assessments
                    </ListItem>
                  </List>
                  <HighlightBox 
                    $type="warning" 
                    $isAlzheimers={isAlzheimers}
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <HighlightText>
                      This assessment is not a substitute for professional medical evaluation. 
                      Always consult with qualified healthcare professionals for diagnosis and treatment decisions.
                    </HighlightText>
                  </HighlightBox>
                </>
              ) : (
                <>
                  <Paragraph>
                    <strong>Important Medical Disclaimer:</strong>
                  </Paragraph>
                  <List>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      This is a screening structure only - not a diagnostic tool
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Results are for screening support and should be interpreted by healthcare professionals
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      This screening structure should not replace professional medical evaluation
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      If you have concerns about Parkinson's disease, please consult with a neurologist
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Motor symptoms should be evaluated by qualified healthcare professionals
                    </ListItem>
                  </List>
                  <HighlightBox 
                    $type="warning" 
                    $isAlzheimers={isAlzheimers}
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <HighlightText>
                      This screening structure is for informational purposes only. It does not 
                      provide medical diagnosis or treatment recommendations. Always consult with 
                      qualified healthcare professionals.
                    </HighlightText>
                  </HighlightBox>
                </>
              )}
            </SectionContent>
          </Section>

          {/* Research & Ethics Section */}
          <Section
            $isAlzheimers={isAlzheimers}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader $isAlzheimers={isAlzheimers}>
              <SectionIcon $isAlzheimers={isAlzheimers}>
                <Shield size={28} />
              </SectionIcon>
              <SectionTitle>Research & Ethics</SectionTitle>
            </SectionHeader>
            <SectionContent>
              {isAlzheimers ? (
                <>
                  <Paragraph>
                    Our research is conducted in accordance with the highest ethical standards and 
                    follows all applicable regulations for medical research and data protection.
                  </Paragraph>
                  <List>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      All data is encrypted and stored securely using industry-standard protocols
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Personal identifiers are anonymized for research purposes
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      We follow HIPAA-compliant data handling procedures
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Research participation is voluntary and can be withdrawn at any time
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      All participants must provide informed consent before participation
                    </ListItem>
                  </List>
                  <Paragraph>
                    Our AI model has been trained on over 50,000 handwriting samples from individuals 
                    with and without cognitive changes, achieving high accuracy in early detection. 
                    All research protocols have been reviewed and approved by our ethics board.
                  </Paragraph>
                  <HighlightBox 
                    $type="success" 
                    $isAlzheimers={isAlzheimers}
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <HighlightText>
                      Your privacy and data security are our top priorities. We never share your 
                      personal information without explicit consent.
                    </HighlightText>
                  </HighlightBox>
                </>
              ) : (
                <>
                  <Paragraph>
                    Our research and development follow strict ethical guidelines and regulatory 
                    standards for medical screening tools.
                  </Paragraph>
                  <List>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      All data is encrypted and stored securely using industry-standard protocols
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Personal identifiers are anonymized for research purposes
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      We follow HIPAA-compliant data handling procedures
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      Research participation is voluntary and can be withdrawn at any time
                    </ListItem>
                    <ListItem $isAlzheimers={isAlzheimers}>
                      All participants must provide informed consent before participation
                    </ListItem>
                  </List>
                  <Paragraph>
                    The Parkinson's screening flow uses the same AI-backed research pipeline used
                    by the NeuroInk assessment experience, with strict privacy and data-handling safeguards.
                  </Paragraph>
                  <HighlightBox 
                    $type="info" 
                    $isAlzheimers={isAlzheimers}
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <HighlightText>
                      This screening interface supports real task capture and AI analysis for screening use.
                      It is not intended to provide clinical diagnosis.
                    </HighlightText>
                  </HighlightBox>
                </>
              )}
            </SectionContent>
          </Section>

          {/* CTA Section */}
          <Section 
            $isAlzheimers={isAlzheimers}
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <PerformTestButton 
              $isAlzheimers={isAlzheimers}
              onClick={handlePerformTest}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAlzheimers ? 'Perform Test' : 'Start Parkinson\'s Test'}
              <ArrowRight size={20} />
            </PerformTestButton>
            {!isAlzheimers && (
              <PerformTestButton 
                $secondary
                $isAlzheimers={isAlzheimers}
                onClick={() => navigate('/parkinsons/tests')}
                style={{ marginTop: '16px' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Open Parkinson's Task List
                <ArrowRight size={20} />
              </PerformTestButton>
            )}
          </Section>
        </div>
      </AwarenessContainer>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Info size={48} color={colors.primary} style={{ margin: '0 auto 16px' }} />
            <ModalTitle>Parkinson's Screening Information</ModalTitle>
            <ModalText>
              The Parkinson's disease assessment is available as a screening flow with
              handwriting tasks and AI-assisted analysis.
            </ModalText>
            <ModalText>
              This experience is intended for screening support and research use only.
              For diagnosis or treatment decisions, please consult qualified clinicians.
            </ModalText>
            <ModalButton $isAlzheimers={isAlzheimers} onClick={() => setShowModal(false)}>
              Understood
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default DiseaseAwareness;
