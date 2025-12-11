import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { consentService } from '../services/consentService';

/**
 * Hook to verify consent before starting a test
 * Returns a function that checks consent and redirects if not accepted
 * Use this before allowing users to start a test
 */
export function useConsentCheck() {
  const navigate = useNavigate();

  const verifyConsent = useCallback(async (): Promise<boolean> => {
    try {
      // First check sync version for immediate feedback
      const syncConsent = consentService.isConsentAcceptedSync();
      
      if (!syncConsent) {
        // Redirect to consent form immediately
        navigate('/consent', { 
          replace: false,
          state: { from: { pathname: window.location.pathname } }
        });
        return false;
      }

      // Then verify with async check (Firestore sync)
      const asyncConsent = await consentService.isConsentAccepted();
      
      if (!asyncConsent) {
        // Consent was revoked or not found in Firestore
        navigate('/consent', { 
          replace: false,
          state: { from: { pathname: window.location.pathname } }
        });
        return false;
      }

      // Consent is verified
      return true;
    } catch (error) {
      console.error('Error checking consent:', error);
      // On error, check localStorage as fallback
      const fallbackConsent = consentService.isConsentAcceptedSync();
      if (!fallbackConsent) {
        navigate('/consent', { 
          replace: false,
          state: { from: { pathname: window.location.pathname } }
        });
        return false;
      }
      return true;
    }
  }, [navigate]);

  return { verifyConsent };
}

