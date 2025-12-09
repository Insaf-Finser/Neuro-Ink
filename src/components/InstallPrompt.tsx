import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

// Light-weight type to satisfy TypeScript for the deferred prompt event
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const Banner = styled.div`
  position: sticky;
  top: 0;
  z-index: 120;
  margin: 0 auto;
  width: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  flex-wrap: wrap;
`;

const Message = styled.span`
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Button = styled.button`
  background: white;
  color: #5b5fc7;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-1px);
  }
`;

const GhostButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 7px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }
`;

const MobileInstruction = styled.span`
  font-size: 0.95rem;
  opacity: 0.95;
`;

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [promptSupported, setPromptSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const isMobile = useMemo(
    () => /iphone|ipad|ipod|android/i.test(window.navigator.userAgent || ''),
    []
  );

  // Detect standalone (Android + iOS Safari)
  const checkStandalone = useMemo(
    () => () => {
      const standaloneDisplay =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore - iOS Safari exposes navigator.standalone
        Boolean(window.navigator.standalone);
      setIsStandalone(standaloneDisplay);
    },
    []
  );

  useEffect(() => {
    checkStandalone();
    if (isMobile) {
      setVisible(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPromptSupported(true);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', checkStandalone);
    };
  }, [checkStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (isStandalone || !visible) {
    return null;
  }

  return (
    <Banner>
      <Message>
        📲 Install NeuroInk for a faster, fullscreen experience.
      </Message>
      <Actions>
        {promptSupported ? (
          <Button onClick={handleInstall}>Add to Home Screen</Button>
        ) : (
          <MobileInstruction>
            Open the browser menu and choose “Add to Home Screen”.
          </MobileInstruction>
        )}
        <GhostButton onClick={() => setVisible(false)}>Not now</GhostButton>
      </Actions>
    </Banner>
  );
};

export default InstallPrompt;

