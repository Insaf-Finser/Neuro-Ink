import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Brain, Target, Clock, Users, ArrowRight, Shield, Zap } from 'lucide-react';
import { consentService } from '../services/consentService';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 48px;
  opacity: 0.9;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled.button`
  background: white;
  color: #667eea;
  padding: 18px 36px;
  border-radius: 12px;
  border: none;
  font-size: 18px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FeaturesSection = styled.section`
  padding: 100px 0;
  background: white;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 64px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 64px;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #f0f0f0;
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const StatsSection = styled.section`
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-top: 48px;
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartAssessment = async () => {
    setLoading(true);
    try {
      // Check if consent is accepted
      const consentAccepted = await consentService.isConsentAccepted();
      
      if (consentAccepted) {
        // If consent is accepted, go directly to tasks
        navigate('/tasks');
      } else {
        // If consent is not accepted, go to welcome page (which leads to consent form)
        navigate('/welcome');
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      // On error, default to welcome page
      navigate('/welcome');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeroSection>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HeroTitle>
              Early Detection of Cognitive Changes Through AI-Powered Handwriting Analysis
            </HeroTitle>
            <HeroSubtitle>
              Revolutionary technology that analyzes handwriting biomarkers to detect 
              early signs of cognitive decline, helping save lives through timely intervention.
            </HeroSubtitle>
            <CTAButton onClick={handleStartAssessment} disabled={loading}>
              {loading ? 'Loading...' : 'Start Your Assessment'}
              {!loading && <ArrowRight size={20} />}
            </CTAButton>
          </motion.div>
        </div>
      </HeroSection>

      <FeaturesSection>
        <div className="container">
          <SectionTitle>Why Early Detection Matters</SectionTitle>
          <SectionSubtitle>
            Cognitive changes affect millions worldwide. Early detection can significantly 
            improve treatment outcomes and quality of life.
          </SectionSubtitle>
          
          <FeatureGrid>
            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FeatureIcon>
                <Brain size={40} />
              </FeatureIcon>
              <FeatureTitle>Non-Invasive Testing</FeatureTitle>
              <FeatureDescription>
                Our handwriting analysis requires no blood tests or invasive procedures. 
                Simply write naturally and let our AI analyze subtle biomarkers.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FeatureIcon>
                <Target size={40} />
              </FeatureIcon>
              <FeatureTitle>High Accuracy</FeatureTitle>
              <FeatureDescription>
                Advanced machine learning algorithms analyze handwriting patterns, 
                pressure, and timing to detect early cognitive changes with high precision.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FeatureIcon>
                <Clock size={40} />
              </FeatureIcon>
              <FeatureTitle>Quick Results</FeatureTitle>
              <FeatureDescription>
                Complete your assessment in just 15-20 minutes and receive 
                immediate results with detailed analysis and recommendations.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <FeatureIcon>
                <Shield size={40} />
              </FeatureIcon>
              <FeatureTitle>Privacy Protected</FeatureTitle>
              <FeatureDescription>
                Your data is encrypted and stored securely. We follow strict 
                privacy protocols and never share your personal information.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <FeatureIcon>
                <Zap size={40} />
              </FeatureIcon>
              <FeatureTitle>Accessible Anywhere</FeatureTitle>
              <FeatureDescription>
                Take the assessment from the comfort of your home using any 
                device with stylus support or touch input capabilities.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <FeatureIcon>
                <Users size={40} />
              </FeatureIcon>
              <FeatureTitle>Family Support</FeatureTitle>
              <FeatureDescription>
                Share results with family members and healthcare providers 
                to ensure comprehensive care and support throughout your journey.
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </div>
      </FeaturesSection>

      <StatsSection>
        <div className="container">
          <SectionTitle style={{ color: 'white' }}>The Impact of Early Detection</SectionTitle>
          <SectionSubtitle style={{ color: 'white', opacity: 0.9 }}>
            Join thousands who have taken control of their cognitive health
          </SectionSubtitle>
          
          <StatsGrid>
            <StatCard>
              <StatNumber>50M+</StatNumber>
              <StatLabel>People affected worldwide</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>5-7</StatNumber>
              <StatLabel>Years earlier detection</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>40%</StatNumber>
              <StatLabel>Better treatment outcomes</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>95%</StatNumber>
              <StatLabel>Test accuracy rate</StatLabel>
            </StatCard>
          </StatsGrid>
        </div>
      </StatsSection>
    </>
  );
};

export default Home;
