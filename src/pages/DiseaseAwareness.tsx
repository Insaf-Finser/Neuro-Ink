import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, FileText, Shield, ArrowRight, Info } from 'lucide-react';
import { DiseaseType } from '../context/DiseaseContext';
import { usePWAManifest } from '../hooks/usePWAManifest';
import ParkinsonsInstallPrompt from '../components/ParkinsonsInstallPrompt';

const AwarenessContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
`;

const AwarenessHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const AwarenessTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 16px;
`;

const AwarenessSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Section = styled.section`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
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
  color: #555;
  line-height: 1.7;
  font-size: 1rem;
`;

const Paragraph = styled.p`
  margin-bottom: 20px;
`;

const List = styled.ul`
  margin-left: 20px;
  margin-bottom: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 12px;
  line-height: 1.6;
`;

const HighlightBox = styled.div<{ $type?: 'info' | 'warning' | 'success' }>`
  background: ${props => 
    props.$type === 'warning' ? '#fff4e6' :
    props.$type === 'success' ? '#e8f5e9' :
    '#f0f4ff'
  };
  border: 2px solid ${props => 
    props.$type === 'warning' ? '#ffd54f' :
    props.$type === 'success' ? '#81c784' :
    '#e8ecff'
  };
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
`;

const HighlightText = styled.p`
  color: #333;
  font-weight: 600;
  line-height: 1.6;
  margin: 0;
`;

const PerformTestButton = styled.button<{ $secondary?: boolean }>`
  background: ${props => props.$secondary 
    ? 'white' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: ${props => props.$secondary ? '#667eea' : 'white'};
  padding: 18px 36px;
  border-radius: 12px;
  border: ${props => props.$secondary ? '2px solid #667eea' : 'none'};
  font-size: 18px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$secondary 
    ? '0 4px 12px rgba(102, 126, 234, 0.2)' 
    : '0 8px 30px rgba(102, 126, 234, 0.3)'};
  cursor: pointer;
  margin-top: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$secondary 
      ? '0 6px 16px rgba(102, 126, 234, 0.3)' 
      : '0 12px 40px rgba(102, 126, 234, 0.4)'};
  }

  &:active {
    transform: translateY(0);
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
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const ModalText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ModalButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
`;

interface DiseaseAwarenessProps {
  disease: DiseaseType;
}

const DiseaseAwareness: React.FC<DiseaseAwarenessProps> = ({ disease }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  
  // Load appropriate manifest based on disease
  usePWAManifest(disease);

  const handlePerformTest = () => {
    if (disease === 'alzheimers') {
      navigate('/alzheimers/dashboard');
    } else {
      // Parkinson's - show coming soon modal
      setShowModal(true);
    }
  };

  const isAlzheimers = disease === 'alzheimers';

  return (
    <>
      <AwarenessContainer>
        <div className="container">
          <AwarenessHeader>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <AwarenessTitle>
                {isAlzheimers ? 'Alzheimer\'s Disease' : 'Parkinson\'s Disease'}
              </AwarenessTitle>
              <AwarenessSubtitle>
                {isAlzheimers 
                  ? 'Understanding early detection and cognitive assessment through handwriting analysis'
                  : 'Understanding motor and cognitive assessment through handwriting analysis'}
              </AwarenessSubtitle>
            </motion.div>
          </AwarenessHeader>

          {/* Show install prompt for Parkinson's only */}
          {!isAlzheimers && <ParkinsonsInstallPrompt />}

          <Section>
            <SectionTitle>
              <Brain size={32} />
              Awareness
            </SectionTitle>
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
                  <HighlightBox>
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
                  <HighlightBox $type="info">
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

          <Section>
            <SectionTitle>
              <FileText size={32} />
              Instructions
            </SectionTitle>
            <SectionContent>
              {isAlzheimers ? (
                <>
                  <Paragraph>
                    To complete the Alzheimer's assessment, you will be asked to:
                  </Paragraph>
                  <List>
                    <ListItem>Complete a series of handwriting tasks on a touch-enabled device</ListItem>
                    <ListItem>Perform cognitive tests including memory, attention, and spatial reasoning</ListItem>
                    <ListItem>Allow our AI system to analyze your handwriting patterns and biomarkers</ListItem>
                    <ListItem>Review your results and recommendations</ListItem>
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
                    <ListItem>Handwriting tasks designed to assess motor control and coordination</ListItem>
                    <ListItem>Basic cognitive assessments to evaluate cognitive function</ListItem>
                    <ListItem>Analysis of handwriting patterns for motor and cognitive indicators</ListItem>
                    <ListItem>Review of screening results (for informational purposes only)</ListItem>
                  </List>
                  <Paragraph>
                    Please note: This is a screening structure only. The Parkinson's assessment 
                    is currently under development and not yet available for full testing.
                  </Paragraph>
                </>
              )}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <AlertTriangle size={32} />
              Cautions
            </SectionTitle>
            <SectionContent>
              {isAlzheimers ? (
                <>
                  <Paragraph>
                    <strong>Important Medical Disclaimer:</strong>
                  </Paragraph>
                  <List>
                    <ListItem>This assessment is for screening purposes only and does not replace professional medical diagnosis</ListItem>
                    <ListItem>Results should be shared with healthcare professionals for proper interpretation</ListItem>
                    <ListItem>If you have concerns about your cognitive health, please consult with a neurologist or healthcare provider</ListItem>
                    <ListItem>This tool is not intended for emergency situations - seek immediate medical attention if needed</ListItem>
                    <ListItem>Results may vary and should be interpreted in context with other clinical assessments</ListItem>
                  </List>
                  <HighlightBox $type="warning">
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
                    <ListItem>This is a screening structure only - not a diagnostic tool</ListItem>
                    <ListItem>Parkinson's testing is currently under development and not yet available</ListItem>
                    <ListItem>This screening structure should not replace professional medical evaluation</ListItem>
                    <ListItem>If you have concerns about Parkinson's disease, please consult with a neurologist</ListItem>
                    <ListItem>Motor symptoms should be evaluated by qualified healthcare professionals</ListItem>
                  </List>
                  <HighlightBox $type="warning">
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

          <Section>
            <SectionTitle>
              <Shield size={32} />
              Research & Ethics
            </SectionTitle>
            <SectionContent>
              {isAlzheimers ? (
                <>
                  <Paragraph>
                    Our research is conducted in accordance with the highest ethical standards and 
                    follows all applicable regulations for medical research and data protection.
                  </Paragraph>
                  <List>
                    <ListItem>All data is encrypted and stored securely using industry-standard protocols</ListItem>
                    <ListItem>Personal identifiers are anonymized for research purposes</ListItem>
                    <ListItem>We follow HIPAA-compliant data handling procedures</ListItem>
                    <ListItem>Research participation is voluntary and can be withdrawn at any time</ListItem>
                    <ListItem>All participants must provide informed consent before participation</ListItem>
                  </List>
                  <Paragraph>
                    Our AI model has been trained on over 50,000 handwriting samples from individuals 
                    with and without cognitive changes, achieving high accuracy in early detection. 
                    All research protocols have been reviewed and approved by our ethics board.
                  </Paragraph>
                  <HighlightBox $type="success">
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
                    <ListItem>All data is encrypted and stored securely using industry-standard protocols</ListItem>
                    <ListItem>Personal identifiers are anonymized for research purposes</ListItem>
                    <ListItem>We follow HIPAA-compliant data handling procedures</ListItem>
                    <ListItem>Research participation is voluntary and can be withdrawn at any time</ListItem>
                    <ListItem>All participants must provide informed consent before participation</ListItem>
                  </List>
                  <Paragraph>
                    The Parkinson's screening structure is currently under development. Research 
                    protocols are being established to ensure accuracy and ethical compliance before 
                    full deployment.
                  </Paragraph>
                  <HighlightBox $type="info">
                    <HighlightText>
                      This screening structure is for research and development purposes. Full 
                      Parkinson's assessment capabilities are coming soon.
                    </HighlightText>
                  </HighlightBox>
                </>
              )}
            </SectionContent>
          </Section>

          <Section style={{ textAlign: 'center' }}>
            <PerformTestButton onClick={handlePerformTest}>
              {isAlzheimers ? 'Perform Test' : 'View Screening Structure'}
              <ArrowRight size={20} />
            </PerformTestButton>
            {!isAlzheimers && (
              <PerformTestButton 
                $secondary
                onClick={() => navigate('/parkinsons/tests')}
                style={{ marginTop: '16px' }}
              >
                View Test UI (Prototype)
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
            <Info size={48} color="#667eea" style={{ margin: '0 auto 16px' }} />
            <ModalTitle>Parkinson's Test Coming Soon</ModalTitle>
            <ModalText>
              The Parkinson's disease assessment is currently under development. 
              We're working hard to bring you a comprehensive screening tool that 
              meets our high standards for accuracy and reliability.
            </ModalText>
            <ModalText>
              Please check back soon, or contact us to be notified when the Parkinson's 
              assessment becomes available.
            </ModalText>
            <ModalButton onClick={() => setShowModal(false)}>
              Understood
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default DiseaseAwareness;

