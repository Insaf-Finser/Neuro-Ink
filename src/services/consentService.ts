// Consent service to persist and check user consent in Firestore

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

const CONSENT_KEY = 'consentAccepted'; // Fallback localStorage key

interface ConsentData {
  accepted: boolean;
  acceptedAt: any; // Firestore timestamp
  userId: string;
}

/**
 * Sets consent status in Firestore for the current user
 * Falls back to localStorage if user is not authenticated
 */
export async function setConsentAccepted(accepted: boolean): Promise<void> {
  try {
    const user = auth.currentUser;
    
    if (user) {
      // Store in Firestore
      const consentRef = doc(db, 'users', user.uid, 'data', 'consent');
      await setDoc(consentRef, {
        accepted,
        acceptedAt: serverTimestamp(),
        userId: user.uid,
      } as ConsentData);
      
      // Also sync to localStorage for offline access
      if (accepted) {
        localStorage.setItem(CONSENT_KEY, 'true');
      } else {
        localStorage.removeItem(CONSENT_KEY);
      }
    } else {
      // Fallback to localStorage for guest users
      if (accepted) {
        localStorage.setItem(CONSENT_KEY, 'true');
      } else {
        localStorage.removeItem(CONSENT_KEY);
      }
    }
  } catch (error) {
    console.error('Error setting consent:', error);
    // Fallback to localStorage on error
    if (accepted) {
      localStorage.setItem(CONSENT_KEY, 'true');
    } else {
      localStorage.removeItem(CONSENT_KEY);
    }
  }
}

/**
 * Checks consent status from Firestore for the current user
 * Falls back to localStorage if user is not authenticated or on error
 * IMPORTANT: Firestore is the source of truth. localStorage is only used as a cache.
 * We NEVER automatically sync localStorage to Firestore to prevent unauthorized consent acceptance.
 */
export async function isConsentAccepted(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    
    if (user) {
      // Firestore is the source of truth for authenticated users
      const consentRef = doc(db, 'users', user.uid, 'data', 'consent');
      const consentSnap = await getDoc(consentRef);
      
      if (consentSnap.exists()) {
        const data = consentSnap.data() as ConsentData;
        // Sync to localStorage for offline access (read-only cache)
        if (data.accepted) {
          localStorage.setItem(CONSENT_KEY, 'true');
        } else {
          localStorage.removeItem(CONSENT_KEY);
        }
        return data.accepted;
      }
      
      // If not in Firestore, consent is NOT accepted (even if localStorage has it)
      // This prevents automatic consent acceptance from stale localStorage data
      // Clear any stale localStorage data
      localStorage.removeItem(CONSENT_KEY);
      return false;
    } else {
      // For guest users, localStorage is the only storage option
      return localStorage.getItem(CONSENT_KEY) === 'true';
    }
  } catch (error) {
    console.error('Error checking consent:', error);
    // On error, don't trust localStorage - return false to be safe
    // Only use localStorage as fallback if user is not authenticated
    const user = auth.currentUser;
    if (!user) {
      return localStorage.getItem(CONSENT_KEY) === 'true';
    }
    return false;
  }
}

/**
 * Synchronous version for immediate checks (uses localStorage cache)
 * NOTE: This is only a cache check. For authenticated users, always verify with isConsentAccepted()
 * to ensure Firestore is the source of truth.
 */
export function isConsentAcceptedSync(): boolean {
  try {
    const user = auth.currentUser;
    // For authenticated users, localStorage is just a cache
    // If we're authenticated, we should verify with Firestore
    // But for immediate UI feedback, we can check the cache
    // The async version will correct any discrepancies
    return localStorage.getItem(CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function requireConsentOrThrow(): void {
  if (!isConsentAcceptedSync()) {
    throw new Error('CONSENT_REQUIRED');
  }
}

export async function clearConsent(): Promise<void> {
  await setConsentAccepted(false);
}

export const consentService = {
  setConsentAccepted,
  isConsentAccepted,
  isConsentAcceptedSync,
  requireConsentOrThrow,
  clearConsent
};


