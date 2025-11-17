// Simple consent service to persist and check user consent

const CONSENT_KEY = 'consentAccepted';

export function setConsentAccepted(accepted: boolean): void {
  try {
    if (accepted) {
      localStorage.setItem(CONSENT_KEY, 'true');
    } else {
      localStorage.removeItem(CONSENT_KEY);
    }
  } catch {}
}

export function isConsentAccepted(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function requireConsentOrThrow(): void {
  if (!isConsentAccepted()) {
    throw new Error('CONSENT_REQUIRED');
  }
}

export function clearConsent(): void {
  setConsentAccepted(false);
}

export const consentService = {
  setConsentAccepted,
  isConsentAccepted,
  requireConsentOrThrow,
  clearConsent
};


