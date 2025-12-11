import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { consentService } from '../services/consentService';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #64748b;
`;

const LoadingText = styled.p`
  font-size: 14px;
  font-weight: 500;
`;

interface RequireConsentProps {
  children: React.ReactElement;
}

const RequireConsent: React.FC<RequireConsentProps> = ({ children }) => {
  const location = useLocation();
  const [consentAccepted, setConsentAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConsent = async () => {
      try {
        // First check sync version for immediate UI feedback
        const syncConsent = consentService.isConsentAcceptedSync();
        
        // If no consent in localStorage, redirect immediately
        if (!syncConsent) {
          setConsentAccepted(false);
          setLoading(false);
          return;
        }
        
        // Set initial state based on sync check
        setConsentAccepted(syncConsent);
        setLoading(false);
        
        // Then verify with async check (Firestore sync) in background
        const asyncConsent = await consentService.isConsentAccepted();
        
        // If Firestore check differs, update state
        if (asyncConsent !== syncConsent) {
          setConsentAccepted(asyncConsent);
          // If consent was revoked in Firestore, redirect
          if (!asyncConsent) {
            return;
          }
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        // Fallback to sync check on error
        const fallbackConsent = consentService.isConsentAcceptedSync();
        setConsentAccepted(fallbackConsent);
        setLoading(false);
      }
    };
    
    checkConsent();
    
    // Re-check consent periodically to catch any changes
    const interval = setInterval(() => {
      const currentConsent = consentService.isConsentAcceptedSync();
      if (currentConsent !== consentAccepted) {
        setConsentAccepted(currentConsent);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [consentAccepted]);

  if (loading || consentAccepted === null) {
    return (
      <LoadingContainer>
        <LoadingText>Verifying consent...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!consentAccepted) {
    console.log('RequireConsent - Redirecting to consent from:', location.pathname);
    return <Navigate to="/consent" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireConsent;


