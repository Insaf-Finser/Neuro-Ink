import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Activity, Brain, ClipboardList, Home, Shield } from 'lucide-react';
import InstallPrompt from './InstallPrompt';
import { useStandalone } from '../hooks/useStandalone';

const AppShell = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #111827 35%, #0b1022 100%);
  color: #0f1425;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 120;
  padding: calc(10px + env(safe-area-inset-top)) 18px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AppName = styled.span`
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.01em;
`;

const Tagline = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

const StatusPill = styled.div`
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  font-weight: 600;
  font-size: 12px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const Surface = styled.div`
  flex: 1;
  background: #f7f7fb;
  border-radius: 18px 18px 0 0;
  margin-top: 8px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
  padding: 12px 12px calc(100px + env(safe-area-inset-bottom));
  max-width: 1024px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
`;

const Footer = styled.footer`
  color: #4b5563;
  text-align: center;
  padding: 18px 12px 0;
  font-size: 13px;
`;

const BottomNav = styled.nav`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;
  padding: 10px 14px calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  z-index: 110;
  box-shadow: 0 -8px 28px rgba(15, 23, 42, 0.16);
`;

const NavButton = styled(Link)<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 4px;
  text-decoration: none;
  color: ${props => (props.$active ? '#5b5fc7' : '#4b5563')};
  background: ${props => (props.$active ? 'rgba(102, 126, 234, 0.12)' : 'transparent')};
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const DesktopNotice = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
  padding: 80px 20px;
  color: white;
  text-align: center;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
`;

const NoticeCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
  max-width: 540px;
  width: 100%;
`;

const NoticeTitle = styled.h2`
  margin-bottom: 6px;
  font-size: 20px;
`;

const NoticeText = styled.p`
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.5;
`;

const Blocker = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  justify-content: center;
  padding: 40px 18px 28px;
  text-align: center;
  color: white;
`;

const BlockerCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 520px;
  display: grid;
  gap: 10px;
`;

const StepList = styled.ol`
  text-align: left;
  color: rgba(255, 255, 255, 0.88);
  display: grid;
  gap: 6px;
  padding-left: 18px;
  margin: 0;
  font-size: 14px;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(true);
  const isStandalone = useStandalone();

  useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth <= 1080);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Block zoom gestures (pinch, ctrl+wheel, double-tap zoom on iOS)
  useEffect(() => {
    const preventGesture = (event: Event) => event.preventDefault();
    const preventCtrlWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    document.addEventListener('gestureend', preventGesture);
    window.addEventListener('wheel', preventCtrlWheel, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      window.removeEventListener('wheel', preventCtrlWheel);
    };
  }, []);

  const navItems = useMemo(
    () => [
      { to: '/', label: 'Home', icon: <Home /> },
      { to: '/dashboard', label: 'Dashboard', icon: <Shield /> },
      { to: '/tasks', label: 'Tasks', icon: <ClipboardList /> },
      { to: '/results', label: 'Results', icon: <Activity /> },
    ],
    []
  );

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/tasks') return location.pathname.startsWith('/test') || location.pathname.startsWith('/tasks');
    if (path === '/results') {
      return (
        location.pathname.startsWith('/results') ||
        location.pathname.startsWith('/ai-analysis') ||
        location.pathname.startsWith('/comprehensive-results')
      );
    }
    return location.pathname.startsWith(path);
  };

  if (!isMobileOrTablet) {
    return (
      <AppShell>
        <TopBar>
          <TitleBlock>
            <Brain size={32} />
            <Title>
              <AppName>NeuroInk</AppName>
              <Tagline>Optimized for touch devices</Tagline>
            </Title>
          </TitleBlock>
          <StatusPill>Phone / Tablet</StatusPill>
        </TopBar>
        <DesktopNotice>
          <NoticeCard>
            <NoticeTitle>This experience is mobile-first</NoticeTitle>
            <NoticeText>
              NeuroInk is designed to run as a Progressive Web App on phones and tablets.
              Please open this link on a mobile device or resize below 1080px to preview the app UI.
            </NoticeText>
          </NoticeCard>
        </DesktopNotice>
      </AppShell>
    );
  }

  if (!isStandalone) {
    return (
      <AppShell>
        <TopBar>
          <TitleBlock>
            <Brain size={32} />
            <Title>
              <AppName>NeuroInk</AppName>
              <Tagline>Install to continue</Tagline>
            </Title>
          </TitleBlock>
          <StatusPill>Install required</StatusPill>
        </TopBar>
        <InstallPrompt />
        <Blocker>
          <BlockerCard>
            <NoticeTitle>Add NeuroInk to your home screen</NoticeTitle>
            <NoticeText>
              For secure, full-screen testing we require the PWA to be installed on your phone or tablet.
            </NoticeText>
            <StepList>
              <li>Tap “Add to Home Screen” when prompted.</li>
              <li>Open NeuroInk from your home screen icon.</li>
              <li>Run assessments offline with full-screen capture.</li>
            </StepList>
          </BlockerCard>
        </Blocker>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar>
        <TitleBlock>
          <Brain size={32} />
          <Title>
            <AppName>NeuroInk</AppName>
            <Tagline>AI-powered cognitive screening</Tagline>
          </Title>
        </TitleBlock>
        <StatusPill>PWA ready</StatusPill>
      </TopBar>

      <InstallPrompt />

      <Surface>
        <Main>{children}</Main>
        <Footer>
          <p>&copy; 2025 NeuroInk — built for clinical-grade mobile capture.</p>
          <p>Install to access full-screen, offline-ready testing.</p>
        </Footer>
      </Surface>

      <BottomNav>
        {navItems.map(item => (
          <NavButton key={item.to} to={item.to} $active={isActive(item.to)}>
            {item.icon}
            <span>{item.label}</span>
          </NavButton>
        ))}
      </BottomNav>
    </AppShell>
  );
};

export default Layout;
