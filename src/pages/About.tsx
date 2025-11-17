import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Brain, 
  Target, 
  FileText, 
  Lock,
  Eye,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const AboutContainer = styled.div`
  padding: 60px 0;
  min-height: calc(100vh - 160px);
`;

const AboutHeader = styled.div`
  text-align: center;
  margin-bottom: 64px;
`;

const AboutTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 24px;
`;

const AboutSubtitle = styled.p`
  font-size: 1.3rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Section = styled.section`
  background: white;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SectionContent = styled.div`
  color: #555;
  line-height: 1.7;
  font-size: 1.1rem;
`;

const Paragraph = styled.p`
  margin-bottom: 20px;
`;

const List = styled.ul`
  margin-left: 20px;
  margin-bottom: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
`;

const HighlightBox = styled.div`
  background: #f8f9ff;
  border: 2px solid #e8ecff;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
`;

const HighlightText = styled.p`
  color: #333;
  font-weight: 600;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 32px;
`;

const FeatureCard = styled(motion.div)`
  background: #f8f9ff;
  border: 2px solid #e8ecff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const About: React.FC = () => {
  return (
    <AboutContainer>
      <div className="container">
        <AboutHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AboutTitle>About NeuroInk</AboutTitle>
            <AboutSubtitle>
              Revolutionizing early detection of cognitive changes through advanced AI-powered handwriting analysis
            </AboutSubtitle>
          </motion.div>
        </AboutHeader>

        <Section>
          <SectionTitle>
            <Brain size={32} />
            Our Mission
          </SectionTitle>
          <SectionContent>
            <Paragraph>
              NeuroInk is dedicated to revolutionizing the early detection of cognitive changes, 
              particularly Alzheimer's disease, through innovative AI-powered handwriting analysis. Our 
              mission is to make cognitive health assessment accessible, accurate, and non-invasive 
              for everyone.
            </Paragraph>
            <Paragraph>
              We believe that early detection is crucial for effective intervention and treatment. 
              By analyzing subtle changes in handwriting patterns, pressure, timing, and spatial 
              relationships, our advanced machine learning algorithms can detect cognitive changes 
              years before traditional methods.
            </Paragraph>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>
            <Target size={32} />
            How It Works
          </SectionTitle>
          <SectionContent>
            <Paragraph>
              Our technology combines cutting-edge artificial intelligence with decades of 
              neuroscience research to analyze handwriting biomarkers that indicate cognitive changes:
            </Paragraph>
            <List>
              <ListItem><strong>Handwriting Analysis:</strong> Pressure patterns, stroke velocity, and spatial relationships</ListItem>
              <ListItem><strong>Cognitive Testing:</strong> Memory, attention, and executive function assessments</ListItem>
              <ListItem><strong>AI Processing:</strong> Machine learning algorithms trained on thousands of samples</ListItem>
              <ListItem><strong>Risk Assessment:</strong> Comprehensive evaluation with probability scoring</ListItem>
            </List>
            <HighlightBox>
              <HighlightText>
                Our AI model has been trained on over 50,000 handwriting samples from individuals 
                with and without cognitive changes, achieving 95% accuracy in early detection.
              </HighlightText>
            </HighlightBox>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>
            <Users size={32} />
            Our Team
          </SectionTitle>
          <SectionContent>
            <Paragraph>
              NeuroInk is developed by a multidisciplinary team of experts in neuroscience, 
              artificial intelligence, and healthcare technology. Our team includes:
            </Paragraph>
            <List>
              <ListItem>Neurologists and cognitive specialists</ListItem>
              <ListItem>AI and machine learning researchers</ListItem>
              <ListItem>Healthcare technology experts</ListItem>
              <ListItem>User experience designers</ListItem>
              <ListItem>Data privacy and security specialists</ListItem>
            </List>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>
            <Shield size={32} />
            Privacy Policy
          </SectionTitle>
          <SectionContent>
            <Paragraph>
              Your privacy and data security are our top priorities. We are committed to protecting 
              your personal information and maintaining the highest standards of data security.
            </Paragraph>
            
            <Grid>
              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <FeatureIcon>
                  <Lock size={28} />
                </FeatureIcon>
                <FeatureTitle>Data Encryption</FeatureTitle>
                <FeatureDescription>
                  All data is encrypted using industry-standard AES-256 encryption both in transit and at rest.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <FeatureIcon>
                  <Eye size={28} />
                </FeatureIcon>
                <FeatureTitle>Anonymization</FeatureTitle>
                <FeatureDescription>
                  Personal identifiers are removed from research data to ensure complete anonymity.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <FeatureIcon>
                  <Globe size={28} />
                </FeatureIcon>
                <FeatureTitle>No Third-Party Sharing</FeatureTitle>
                <FeatureDescription>
                  We never sell or share your personal data with third parties without explicit consent.
                </FeatureDescription>
              </FeatureCard>
            </Grid>

            <Paragraph>
              <strong>Data Collection:</strong> We collect handwriting samples, cognitive test responses, 
              and basic demographic information (age, gender) for analysis purposes.
            </Paragraph>
            <Paragraph>
              <strong>Data Usage:</strong> Your data is used to generate your assessment results and may 
              be used for research purposes in anonymized form to improve our technology.
            </Paragraph>
            <Paragraph>
              <strong>Data Retention:</strong> Assessment data is retained for 7 years for follow-up 
              analysis and research purposes, after which it is securely deleted.
            </Paragraph>
            <Paragraph>
              <strong>Your Rights:</strong> You have the right to access, correct, or delete your data 
              at any time. Contact us to exercise these rights.
            </Paragraph>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>
            <FileText size={32} />
            Terms of Use
          </SectionTitle>
          <SectionContent>
            <Paragraph>
              By using NeuroInk, you agree to the following terms and conditions:
            </Paragraph>
            <List>
              <ListItem>This service is for screening purposes only and does not replace professional medical diagnosis</ListItem>
              <ListItem>Results should be shared with healthcare professionals for proper interpretation</ListItem>
              <ListItem>You must be 18 years or older to use this service</ListItem>
              <ListItem>You agree to provide accurate information during assessments</ListItem>
              <ListItem>We reserve the right to update these terms at any time</ListItem>
            </List>
            <HighlightBox>
              <HighlightText>
                <strong>Important:</strong> If you have concerns about your cognitive health, 
                please consult with a healthcare professional. This assessment is not a 
                substitute for professional medical evaluation.
              </HighlightText>
            </HighlightBox>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>
            <Eye size={32} />
            Accessibility Statement
          </SectionTitle>
          <SectionContent>
            <Paragraph>
              NeuroInk is committed to making our platform accessible to all users, 
              including those with disabilities. We strive to comply with WCAG 2.1 AA standards.
            </Paragraph>
            <List>
              <ListItem>High contrast mode available for better visibility</ListItem>
              <ListItem>Screen reader compatibility for visually impaired users</ListItem>
              <ListItem>Keyboard navigation support for all interactive elements</ListItem>
              <ListItem>Adjustable text sizes and font options</ListItem>
              <ListItem>Alternative input methods for users with motor difficulties</ListItem>
            </List>
            <Paragraph>
              If you encounter any accessibility barriers, please contact our support team 
              and we will work to address them promptly.
            </Paragraph>
          </SectionContent>
        </Section>
      </div>
    </AboutContainer>
  );
};

export default About;
