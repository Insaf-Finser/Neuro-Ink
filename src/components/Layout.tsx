  import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Activity, Brain, ClipboardList, Home, Shield, LogOut, User } from 'lucide-react';
import InstallPrompt from './InstallPrompt';
import { useStandalone } from '../hooks/useStandalone';
import { useAuth } from '../context/AuthContext';
import { consentService } from '../services/consentService';
import toast from 'react-hot-toast';

const AppShell = styled.div`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  background: linear-gradient(180deg, #0f172a 0%, #111827 35%, #0b1022 100%);
  color: #0f1425;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  height: 100vh;
  height: -webkit-fill-available;
`;

const TopBar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  z-index: 120;
  min-height: 60px;
  padding: calc(10px + env(safe-area-inset-top)) 12px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  box-sizing: border-box;
  overflow: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AppName = styled.span`
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Tagline = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  justify-content: flex-end;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
  flex-shrink: 1;
  overflow: hidden;
`;

const UserEmail = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserStatus = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
`;

const SignOutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 11px;
  font-weight: 600;
  gap: 4px;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
  
  span {
    display: none;
    
    @media (min-width: 360px) {
      display: inline;
    }
  }
`;

const AuthButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 11px;
  font-weight: 600;
  gap: 4px;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.6);
  }
  
  span {
    display: none;
    
    @media (min-width: 360px) {
      display: inline;
    }
  }
`;

const Surface = styled.div<{ $hasNavbar?: boolean }>`
  flex: 1;
  background: #f7f7fb;
  border-radius: 18px 18px 0 0;
  margin-top: ${props => props.$hasNavbar ? 'calc(60px + env(safe-area-inset-top) + 8px)' : '0'};
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
  padding: 12px 12px ${props => props.$hasNavbar ? 'calc(100px + env(safe-area-inset-bottom))' : 'calc(12px + env(safe-area-inset-bottom))'};
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

const BottomNavWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 110;
  display: flex;
  justify-content: center;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
`;

const BottomNav = styled.nav`
  width: 100%;
  max-width: 1024px;
  padding: 10px 14px calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  box-shadow: 0 -8px 28px rgba(15, 23, 42, 0.16);
  box-sizing: border-box;
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
  const navigate = useNavigate();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(true);
  const isStandalone = useStandalone();
  const { user, signOut, loading: authLoading } = useAuth();
  const [consentAccepted, setConsentAccepted] = useState<boolean | null>(null);
  const [consentLoading, setConsentLoading] = useState(true);

  // Check consent status
  useEffect(() => {
    const checkConsent = async () => {
      try {
        // First check sync version for immediate UI
        const syncConsent = consentService.isConsentAcceptedSync();
        setConsentAccepted(syncConsent);
        setConsentLoading(false);
        
        // Then sync with Firestore in background
        const asyncConsent = await consentService.isConsentAccepted();
        if (asyncConsent !== syncConsent) {
          setConsentAccepted(asyncConsent);
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        // Fallback to sync check
        setConsentAccepted(consentService.isConsentAcceptedSync());
        setConsentLoading(false);
      }
    };
    
    checkConsent();
    
    // Re-check consent periodically
    const interval = setInterval(() => {
      const currentConsent = consentService.isConsentAcceptedSync();
      if (currentConsent !== consentAccepted) {
        setConsentAccepted(currentConsent);
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, [consentAccepted]);

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

  // Handle viewport changes when keyboard appears/disappears
  useEffect(() => {
    const handleViewportChange = () => {
      // Force navbar to stay in place
      const topBar = document.querySelector('header');
      const bottomNav = document.querySelector('nav');
      
      if (topBar) {
        topBar.style.position = 'fixed';
        topBar.style.top = '0';
      }
      
      if (bottomNav) {
        bottomNav.style.position = 'fixed';
        bottomNav.style.bottom = '0';
      }
    };

    // Listen for visual viewport changes (keyboard events)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }
    
    // Also listen for window resize as fallback
    window.addEventListener('resize', handleViewportChange);
    
    // Handle focus/blur events that might trigger keyboard
    window.addEventListener('focusin', handleViewportChange);
    window.addEventListener('focusout', handleViewportChange);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('focusin', handleViewportChange);
      window.removeEventListener('focusout', handleViewportChange);
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

  // Determine if navbar should be shown
  // Hide navbar if consent is not accepted (unless on public pages like home, welcome, consent, login, signup)
  const publicPages = ['/', '/welcome', '/consent', '/login', '/signup', '/about', '/contact'];
  const isPublicPage = publicPages.includes(location.pathname);
  const shouldShowNavbar = consentAccepted === true || isPublicPage || consentLoading;

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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (!isMobileOrTablet) {
    return (
      <AppShell>
        {shouldShowNavbar && (
          <TopBar>
            <TitleBlock>
              <Brain size={32} />
              <Title>
                <AppName>NeuroInk</AppName>
                <Tagline>Optimized for touch devices</Tagline>
              </Title>
            </TitleBlock>
            <UserMenu>
              {user ? (
                <>
                  <UserInfo>
                    <UserEmail>{user.email}</UserEmail>
                    <UserStatus>Signed in</UserStatus>
                  </UserInfo>
                  <SignOutButton onClick={handleSignOut}>
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </SignOutButton>
                </>
              ) : (
                <AuthButton to="/login">
                  <User size={14} />
                  <span>Sign In</span>
                </AuthButton>
              )}
            </UserMenu>
          </TopBar>
        )}
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
          <UserMenu>
            {user ? (
              <>
                <UserInfo>
                  <UserEmail>{user.email}</UserEmail>
                  <UserStatus>Signed in</UserStatus>
                </UserInfo>
                <SignOutButton onClick={handleSignOut}>
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </SignOutButton>
              </>
            ) : (
              <AuthButton to="/login">
                <User size={14} />
                <span>Sign In</span>
              </AuthButton>
            )}
          </UserMenu>
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
      {shouldShowNavbar && (
        <TopBar>
          <TitleBlock>
            <Brain size={32} />
            <Title>
              <AppName>NeuroInk</AppName>
              <Tagline>AI-powered cognitive screening</Tagline>
            </Title>
          </TitleBlock>
          <UserMenu>
            {user ? (
              <>
                <UserInfo>
                  <UserEmail>{user.email}</UserEmail>
                  <UserStatus>Signed in</UserStatus>
                </UserInfo>
                <SignOutButton onClick={handleSignOut}>
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </SignOutButton>
              </>
            ) : (
              <AuthButton to="/login">
                <User size={14} />
                <span>Sign In</span>
              </AuthButton>
            )}
          </UserMenu>
        </TopBar>
      )}

      <InstallPrompt />

      <Surface $hasNavbar={shouldShowNavbar}>
        <Main>{children}</Main>
        <Footer>
          <p>&copy; 2025 NeuroInk — built for clinical-grade mobile capture.</p>
          <p>Install to access full-screen, offline-ready testing.</p>
        </Footer>
      </Surface>

      {shouldShowNavbar && (
        <BottomNavWrapper>
          <BottomNav>
            {navItems.map(item => (
              <NavButton key={item.to} to={item.to} $active={isActive(item.to)}>
                {item.icon}
                <span>{item.label}</span>
              </NavButton>
            ))}
          </BottomNav>
        </BottomNavWrapper>
      )}
    </AppShell>
  );
};

export default Layout;
