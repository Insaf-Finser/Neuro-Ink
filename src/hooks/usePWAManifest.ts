import { useEffect } from 'react';
import { DiseaseType } from '../context/DiseaseContext';

/**
 * Dynamically loads the appropriate manifest based on disease type
 */
export function usePWAManifest(disease: DiseaseType) {
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    
    if (manifestLink) {
      // Update manifest based on disease
      if (disease === 'parkinsons') {
        manifestLink.href = '/manifest-parkinsons.json';
      } else {
        // Default to Alzheimer's manifest
        manifestLink.href = '/manifest.json';
      }
    }
  }, [disease]);
}



