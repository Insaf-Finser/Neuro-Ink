import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  FileText, 
  Target, 
  ArrowRight, 
  CheckCircle,
  Users,
  Shield,
  Zap
} from 'lucide-react';

const WelcomeContainer = styled.div`
  padding: 20px 12px;
  min-height: calc(100vh - 160px);
  max-width: 100%;
  margin: 0 auto;
`;

const WelcomeHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding: 0 4px;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.3;
`;

const WelcomeSubtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  max-width: 100%;
  margin: 0 auto;
  line-height: 1.5;
`;

const ProcessSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ProcessSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const ProcessStep = styled(motion.div)`
  text-align: center;
  padding: 16px 12px;
  border-radius: 12px;
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    border-color: #667eea;
  }
`;

const StepNumber = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  font-size: 1rem;
  font-weight: bold;
`;

const StepIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
`;

const StepTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
`;

const StepDescription = styled.p`
  color: #666;
  line-height: 1.4;
  font-size: 0.8rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.4;
  font-size: 0.8rem;
`;

const CTAButton = styled(Link)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  margin: 0 auto;
  max-width: 100%;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
`;

const ImportantInfo = styled.div`
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ImportantTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
`;

const ImportantText = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.5;
`;

const Welcome: React.FC = () => {
  return (
    <WelcomeContainer>
      <WelcomeHeader>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <WelcomeTitle>Welcome to Your Cognitive Assessment</WelcomeTitle>
          <WelcomeSubtitle>
            You're about to take part in a groundbreaking assessment that uses advanced AI technology 
            to analyze handwriting patterns and detect early signs of cognitive changes. This process 
            is designed to be simple, non-invasive, and highly accurate.
          </WelcomeSubtitle>
        </motion.div>
      </WelcomeHeader>

      <ProcessSection>
          <SectionTitle>How It Works</SectionTitle>
          <SectionSubtitle>
            Our assessment consists of four carefully designed tests that evaluate different aspects of cognitive function
          </SectionSubtitle>

          <ProcessSteps>
            <ProcessStep
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <StepNumber>1</StepNumber>
              <StepTitle>Clock Drawing Test</StepTitle>
              <StepDescription>
                Draw a clock face and set the time to 10:10. This test evaluates spatial cognition, 
                executive function, and visual-spatial abilities.
              </StepDescription>
            </ProcessStep>

            <ProcessStep
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <StepNumber>2</StepNumber>
              <StepTitle>Word Recall Test</StepTitle>
              <StepDescription>
                Memorize 4 words, then recall and write them after a delay. This test assesses 
                verbal memory and learning abilities.
              </StepDescription>
            </ProcessStep>

            <ProcessStep
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StepNumber>3</StepNumber>
              <StepTitle>Image Association Test</StepTitle>
              <StepDescription>
                Associate images with numbers/letters, then recall the associations. This test 
                evaluates visual memory and associative learning.
              </StepDescription>
            </ProcessStep>

            <ProcessStep
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StepNumber>4</StepNumber>
              <StepTitle>Selection Memory Test</StepTitle>
              <StepDescription>
                Select items from a list, then identify them again after rearrangement. This test 
                measures attention, working memory, and recognition abilities.
              </StepDescription>
            </ProcessStep>
        </ProcessSteps>
      </ProcessSection>

      <FeaturesGrid>
          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FeatureIcon>
              <Brain size={20} />
            </FeatureIcon>
            <FeatureTitle>AI-Powered Analysis</FeatureTitle>
            <FeatureDescription>
              Our advanced machine learning algorithms analyze handwriting patterns, pressure, 
              timing, and spatial relationships to detect subtle cognitive changes.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FeatureIcon>
              <Shield size={20} />
            </FeatureIcon>
            <FeatureTitle>Privacy & Security</FeatureTitle>
            <FeatureDescription>
              Your data is encrypted and stored securely. We follow strict privacy protocols 
              and never share your personal information without consent.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FeatureIcon>
              <Zap size={20} />
            </FeatureIcon>
            <FeatureTitle>Quick & Easy</FeatureTitle>
            <FeatureDescription>
              Complete the entire assessment in just 15-20 minutes. No special equipment needed 
              - just a device with stylus or touch input capabilities.
            </FeatureDescription>
          </FeatureCard>
      </FeaturesGrid>

      <ImportantInfo>
        <ImportantTitle>Important Information</ImportantTitle>
        <ImportantText>
          This assessment is designed for screening purposes only and should not replace 
          professional medical diagnosis. If you have concerns about your cognitive health, 
          please consult with a healthcare professional. Results should be shared with your 
          doctor for proper interpretation and follow-up care.
        </ImportantText>
      </ImportantInfo>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <CTAButton to="/consent">
          I Understand - Continue to Consent
          <ArrowRight size={20} />
        </CTAButton>
      </motion.div>
    </WelcomeContainer>
  );
};

export default Welcome;
