import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Shield,
  FileText,
  Users,
  Lock
} from 'lucide-react';

import { consentService } from '../services/consentService';

const ConsentContainer = styled.div`
  padding: 60px 0;
  min-height: calc(100vh - 160px);
`;

const ConsentHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const ConsentTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 24px;
`;

const ConsentSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ConsentForm = styled.div`
  background: white;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionContent = styled.div`
  margin-bottom: 40px;
`;

const Paragraph = styled.p`
  color: #555;
  line-height: 1.7;
  margin-bottom: 16px;
`;

const List = styled.ul`
  color: #555;
  line-height: 1.7;
  margin-left: 20px;
  margin-bottom: 16px;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin: 32px 0;
  padding: 24px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 2px solid #e8ecff;
`;

const Checkbox = styled.input`
  width: 24px;
  height: 24px;
  margin-top: 4px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: #333;
  font-weight: 600;
  line-height: 1.6;
  cursor: pointer;
  flex: 1;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 48px;
`;

const ConsentButton = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #f8f9fa;
    color: #6c757d;
    border: 2px solid #e9ecef;
    
    &:hover:not(:disabled) {
      background: #e9ecef;
      color: #495057;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const Button = styled(Link)<{ $primary?: boolean; $disabled?: boolean }>`
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};

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

const ConsentFormPage: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState(consentService.isConsentAccepted());
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the original destination from the state
  const from = location.state?.from?.pathname || '/tasks';
  
  // Debug logging
  console.log('ConsentForm - location.state:', location.state);
  console.log('ConsentForm - from:', from);

  return (
    <ConsentContainer>
      <div className="container">
        <ConsentHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ConsentTitle>Informed Consent</ConsentTitle>
            <ConsentSubtitle>
              Before beginning your cognitive assessment, please read and understand the following information 
              about the assessment process, your rights, and how your data will be used.
            </ConsentSubtitle>
          </motion.div>
        </ConsentHeader>

        <ConsentForm>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SectionTitle>
              <Shield size={24} />
              Purpose of the Assessment
            </SectionTitle>
            <SectionContent>
              <Paragraph>
                This cognitive assessment is designed to evaluate various aspects of cognitive function 
                through handwriting analysis and memory tasks. The assessment uses advanced artificial 
                intelligence to analyze handwriting patterns, pressure, timing, and spatial relationships 
                to detect potential early signs of cognitive changes.
              </Paragraph>
              <Paragraph>
                The assessment is intended for screening purposes only and should not replace professional 
                medical diagnosis or treatment. Results should be shared with healthcare professionals 
                for proper interpretation and follow-up care.
              </Paragraph>
            </SectionContent>

            <SectionTitle>
              <FileText size={24} />
              What the Assessment Involves
            </SectionTitle>
            <SectionContent>
              <Paragraph>The assessment consists of four main tasks:</Paragraph>
              <List>
                <ListItem><strong>Clock Drawing Test:</strong> Drawing a clock face and setting the time</ListItem>
                <ListItem><strong>Word Recall Test:</strong> Memorizing and recalling words after a delay</ListItem>
                <ListItem><strong>Image Association Test:</strong> Associating images with numbers/letters</ListItem>
                <ListItem><strong>Selection Memory Test:</strong> Selecting and recalling items from lists</ListItem>
              </List>
              <Paragraph>
                Each task is designed to evaluate different cognitive functions including spatial cognition, 
                memory, attention, and executive function. The entire assessment typically takes 15-20 minutes to complete.
              </Paragraph>
            </SectionContent>

            <SectionTitle>
              <Lock size={24} />
              Data Collection and Privacy
            </SectionTitle>
            <SectionContent>
              <Paragraph>
                During the assessment, we will collect the following types of data:
              </Paragraph>
              <List>
                <ListItem>Handwriting samples and drawing patterns</ListItem>
                <ListItem>Response times and accuracy for memory tasks</ListItem>
                <ListItem>Spatial and temporal data from drawing tasks</ListItem>
                <ListItem>Demographic information (age, gender) for analysis purposes</ListItem>
              </List>
              <HighlightBox>
                <HighlightText>
                  <strong>Your privacy is our priority.</strong> All data is encrypted and stored securely. 
                  We follow strict privacy protocols and never share your personal information with third 
                  parties without your explicit consent. Your data may be used for research purposes 
                  to improve the assessment technology, but only in anonymized form.
                </HighlightText>
              </HighlightBox>
            </SectionContent>

            <SectionTitle>
              <Users size={24} />
              Your Rights and Responsibilities
            </SectionTitle>
            <SectionContent>
              <Paragraph><strong>You have the right to:</strong></Paragraph>
              <List>
                <ListItem>Withdraw from the assessment at any time</ListItem>
                <ListItem>Request access to your assessment data</ListItem>
                <ListItem>Request deletion of your data</ListItem>
                <ListItem>Ask questions about the assessment process</ListItem>
                <ListItem>Receive your results and recommendations</ListItem>
              </List>
              <Paragraph><strong>Your responsibilities include:</strong></Paragraph>
              <List>
                <ListItem>Providing accurate demographic information</ListItem>
                <ListItem>Completing tasks to the best of your ability</ListItem>
                <ListItem>Following instructions carefully</ListItem>
                <ListItem>Sharing results with healthcare professionals as appropriate</ListItem>
              </List>
            </SectionContent>

            <SectionTitle>
              <AlertCircle size={24} />
              Important Limitations
            </SectionTitle>
            <SectionContent>
              <HighlightBox>
                <HighlightText>
                  <strong>This assessment is for screening purposes only.</strong> It is not a diagnostic tool 
                  and should not replace professional medical evaluation. If you have concerns about your 
                  cognitive health, please consult with a healthcare professional. The results should be 
                  interpreted in the context of your overall health and medical history.
                </HighlightText>
              </HighlightBox>
              <Paragraph>
                The assessment may not be suitable for individuals with certain conditions such as severe 
                visual impairment, motor disorders affecting handwriting, or severe cognitive impairment 
                that prevents task completion.
              </Paragraph>
            </SectionContent>

            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
              />
              <CheckboxLabel htmlFor="consent">
                I have read and understood the information provided above. I consent to participate 
                in this cognitive assessment and understand that the results are for screening purposes only. 
                I agree to the collection and analysis of my handwriting and cognitive data as described, 
                and I understand my rights regarding my data.
              </CheckboxLabel>
            </CheckboxContainer>

            <ButtonContainer>
              <Button to="/welcome" $primary={false}>
                <ArrowLeft size={20} />
                Back to Welcome
              </Button>
              <ConsentButton 
                $primary={true}
                $disabled={!consentGiven}
                onClick={() => {
                  console.log('Consent button clicked - consentGiven:', consentGiven);
                  console.log('Consent button clicked - from:', from);
                  if (consentGiven) {
                    consentService.setConsentAccepted(true);
                    console.log('Navigating to:', from);
                    navigate(from);
                  }
                }}
              >
                I Consent - Begin Assessment
                <ArrowRight size={20} />
              </ConsentButton>
            </ButtonContainer>
          </motion.div>
        </ConsentForm>
      </div>
    </ConsentContainer>
  );
};

export default ConsentFormPage;
