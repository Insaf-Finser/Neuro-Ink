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
  padding: 20px 12px;
  min-height: calc(100vh - 160px);
  max-width: 100%;
  margin: 0 auto;
`;

const ConsentHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 0 4px;
`;

const ConsentTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.3;
`;

const ConsentSubtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  max-width: 100%;
  margin: 0 auto;
  line-height: 1.5;
`;

const ConsentForm = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionContent = styled.div`
  margin-bottom: 20px;
`;

const Paragraph = styled.p`
  color: #555;
  line-height: 1.5;
  margin-bottom: 12px;
  font-size: 0.9rem;
`;

const List = styled.ul`
  color: #555;
  line-height: 1.5;
  margin-left: 16px;
  margin-bottom: 12px;
  font-size: 0.9rem;
`;

const ListItem = styled.li`
  margin-bottom: 6px;
`;

const HighlightBox = styled.div`
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`;

const HighlightText = styled.p`
  color: #333;
  font-weight: 600;
  line-height: 1.5;
  font-size: 0.9rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 20px 0;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 1px solid #e8ecff;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
`;

const CheckboxLabel = styled.label`
  color: #333;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
  flex: 1;
  font-size: 0.9rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

const ConsentButton = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    
    &:active:not(:disabled) {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #e9ecef;
    
    &:active:not(:disabled) {
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
  padding: 14px 20px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:active {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: white;
    color: #667eea;
    border: 1px solid #667eea;

    &:active {
      background: #667eea;
      color: white;
    }
  `}
`;

const ConsentFormPage: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the original destination from the state
  const from = location.state?.from?.pathname || '/tasks';
  
  // Load consent status on mount (for display purposes only)
  // IMPORTANT: Always start with checkbox unchecked - user must explicitly check it
  React.useEffect(() => {
    const loadConsent = async () => {
      try {
        // Check if consent is already accepted (for informational purposes)
        const accepted = await consentService.isConsentAccepted();
        // Don't pre-check the checkbox - user must explicitly check it
        // This ensures consent is always given intentionally
        setConsentGiven(false);
      } catch (error) {
        console.error('Error loading consent:', error);
        // Always start unchecked
        setConsentGiven(false);
      } finally {
        setLoading(false);
      }
    };
    loadConsent();
  }, []);
  
  // Debug logging
  console.log('ConsentForm - location.state:', location.state);
  console.log('ConsentForm - from:', from);

  return (
    <ConsentContainer>
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
              <Shield size={18} />
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
              <FileText size={18} />
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
              <Lock size={18} />
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
              <Users size={18} />
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
              <AlertCircle size={18} />
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
                $disabled={!consentGiven || saving || loading}
                onClick={async () => {
                  console.log('Consent button clicked - consentGiven:', consentGiven);
                  console.log('Consent button clicked - from:', from);
                  if (consentGiven && !saving) {
                    setSaving(true);
                    try {
                      await consentService.setConsentAccepted(true);
                      console.log('Navigating to:', from);
                      navigate(from);
                    } catch (error) {
                      console.error('Error saving consent:', error);
                      // Still navigate on error (consent saved to localStorage)
                      navigate(from);
                    } finally {
                      setSaving(false);
                    }
                  }
                }}
              >
                {saving ? 'Saving...' : 'I Consent - Begin Assessment'}
                <ArrowRight size={20} />
              </ConsentButton>
            </ButtonContainer>
          </motion.div>
        </ConsentForm>
    </ConsentContainer>
  );
};

export default ConsentFormPage;
