import { useEffect, useState } from 'react';

/**
 * Detects if the current device is a mobile phone or tablet
 * Uses both user agent detection and screen size for accuracy
 */
export const useMobileDevice = (): boolean => {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(() => {
    // Check user agent for mobile/tablet devices
    const userAgent = window.navigator.userAgent || '';
    const isMobileUA = /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(userAgent);
    
    // Check screen size (tablets typically have width <= 1024px)
    const isMobileSize = window.innerWidth <= 1024;
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Consider it mobile if:
    // 1. User agent clearly indicates mobile/tablet (most reliable)
    // 2. OR (small screen AND touch capability) - catches tablets and touch-enabled small devices
    // This allows mobile devices even if touch detection fails, but requires touch for desktop-like devices
    return isMobileUA || (isMobileSize && hasTouch);
  });

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(userAgent);
      const isMobileSize = window.innerWidth <= 1024;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobileDevice(isMobileUA || (isMobileSize && hasTouch));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobileDevice;
};

