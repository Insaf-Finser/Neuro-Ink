import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Smartphone, Tablet } from 'lucide-react';
import { useMobileDevice } from '../hooks/useMobileDevice';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(180deg, #0f172a 0%, #111827 35%, #0b1022 100%);
`;

const MessageCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
  max-width: 520px;
  width: 100%;
  text-align: center;
  color: white;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  
  svg {
    width: 48px;
    height: 48px;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
`;

const Message = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.6);
  }
`;

interface MobileOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Component that only renders children on mobile/tablet devices
 * Shows a message on desktop asking users to use a mobile device
 */
const MobileOnlyRoute: React.FC<MobileOnlyRouteProps> = ({ children }) => {
  const isMobileDevice = useMobileDevice();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isMobileDevice) {
    return (
      <Container>
        <MessageCard>
          <IconContainer>
            <Smartphone />
            <Tablet />
          </IconContainer>
          <Title>Tests Available on Mobile Devices</Title>
          <Message>
            NeuroInk tests are designed for mobile phones and tablets to ensure accurate touch-based assessments.
            Please access this page from a mobile device or tablet to continue.
          </Message>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </MessageCard>
      </Container>
    );
  }

  return <>{children}</>;
};

export default MobileOnlyRoute;

