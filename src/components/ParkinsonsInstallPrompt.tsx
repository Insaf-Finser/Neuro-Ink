import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Download, X } from 'lucide-react';

// Light-weight type to satisfy TypeScript for the deferred prompt event
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const Banner = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  position: relative;
`;

const BannerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const BannerTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const BannerMessage = styled.p`
  margin: 0 0 16px 0;
  line-height: 1.6;
  opacity: 0.95;
`;

const InstallButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MobileInstruction = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.5;
`;

interface ParkinsonsInstallPromptProps {
  onDismiss?: () => void;
}

const ParkinsonsInstallPrompt: React.FC<ParkinsonsInstallPromptProps> = ({ onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(true);
  const [promptSupported, setPromptSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const isMobile = /iphone|ipad|ipod|android/i.test(window.navigator.userAgent || '');

  // Detect standalone (Android + iOS Safari)
  const checkStandalone = () => {
    const standaloneDisplay =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore - iOS Safari exposes navigator.standalone
      Boolean(window.navigator.standalone);
    setIsStandalone(standaloneDisplay);
  };

  useEffect(() => {
    checkStandalone();

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPromptSupported(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      if (onDismiss) onDismiss();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', checkStandalone);
    };
  }, [onDismiss]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choiceResult.outcome === 'accepted') {
        setVisible(false);
        if (onDismiss) onDismiss();
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  // Don't show if already installed or not visible
  if (isStandalone || !visible) {
    return null;
  }

  return (
    <Banner>
      <BannerHeader>
        <BannerTitle>
          <Download size={20} />
          Install for Future Screening
        </BannerTitle>
        <CloseButton onClick={handleDismiss} aria-label="Dismiss">
          <X size={18} />
        </CloseButton>
      </BannerHeader>
      <BannerMessage>
        Install the Parkinson's Early Screening app to your home screen. 
        You'll be notified when screening tests become available.
      </BannerMessage>
      {promptSupported && deferredPrompt ? (
        <InstallButton onClick={handleInstall}>
          <Download size={18} />
          Add to Home Screen
        </InstallButton>
      ) : (
        <MobileInstruction>
          {isMobile 
            ? 'Open your browser menu and select "Add to Home Screen" to install.'
            : 'This app can be installed on mobile devices for a better experience.'}
        </MobileInstruction>
      )}
    </Banner>
  );
};

export default ParkinsonsInstallPrompt;


