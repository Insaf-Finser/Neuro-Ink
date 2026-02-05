import { useEffect } from 'react';
import { DiseaseType } from '../context/DiseaseContext';

const PARKINSONS_TITLE = "Parkinson's Early Screening";
const ALZHEIMERS_TITLE = 'NeuroInk - AI-Powered Cognitive Assessment';

const PARKINSONS_THEME = '#667eea';
const ALZHEIMERS_THEME = '#764ba2';

const PARKINSONS_ICON = '/images/logo-parkinsons.png';
const ALZHEIMERS_ICON = '/images/logo.png';

/**
 * Dynamically loads the appropriate manifest and document title based on disease type
 * so that when opening at /parkinsons the Parkinson's PWA identity is shown, not Alzheimer's.
 */
export function usePWAManifest(disease: DiseaseType) {
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      if (disease === 'parkinsons') {
        manifestLink.href = '/manifest-parkinsons.json';
      } else {
        manifestLink.href = '/manifest.json';
      }
    }
    document.title = disease === 'parkinsons' ? PARKINSONS_TITLE : ALZHEIMERS_TITLE;

    // Update theme color
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', disease === 'parkinsons' ? PARKINSONS_THEME : ALZHEIMERS_THEME);

    // Update favicons / apple-touch-icon to match disease branding
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    const iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    const chosenIcon = disease === 'parkinsons' ? PARKINSONS_ICON : ALZHEIMERS_ICON;
    if (appleIcon) appleIcon.href = chosenIcon;
    if (iconLink) iconLink.href = chosenIcon;
  }, [disease]);
}



