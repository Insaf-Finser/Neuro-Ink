import { useEffect, useState } from 'react';

// Detect if the app is running as an installed PWA (standalone)
const getStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // @ts-ignore - iOS Safari exposes navigator.standalone
  Boolean(window.navigator.standalone);

export const useStandalone = () => {
  const [standalone, setStandalone] = useState(getStandalone());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = () => setStandalone(getStandalone());

    mediaQuery.addEventListener('change', handler);
    window.addEventListener('appinstalled', handler);
    window.addEventListener('resize', handler);

    // Keep a data attribute on <html> to allow global theming if needed
    document.documentElement.dataset.displayMode = standalone ? 'standalone' : 'browser';

    return () => {
      mediaQuery.removeEventListener('change', handler);
      window.removeEventListener('appinstalled', handler);
      window.removeEventListener('resize', handler);
    };
  }, [standalone]);

  return standalone;
};

