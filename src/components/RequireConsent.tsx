import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isConsentAccepted } from '../services/consentService';

interface RequireConsentProps {
  children: React.ReactElement;
}

const RequireConsent: React.FC<RequireConsentProps> = ({ children }) => {
  const location = useLocation();
  console.log('RequireConsent - isConsentAccepted:', isConsentAccepted());
  console.log('RequireConsent - Current path:', location.pathname);
  
  // Temporarily bypass consent for testing
  console.log('RequireConsent - Bypassing consent for testing, rendering children');
  return children;
  
  // Original consent check (commented out for testing)
  // if (!isConsentAccepted()) {
  //   console.log('RequireConsent - Redirecting to consent from:', location.pathname);
  //   return <Navigate to="/consent" replace state={{ from: location }} />;
  // }
  // console.log('RequireConsent - Consent accepted, rendering children');
  // return children;
};

export default RequireConsent;


