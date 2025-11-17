import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Brain, Home, Info, Mail, Shield, FileText } from 'lucide-react';

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #667eea;
  font-size: 24px;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  text-decoration: none;
  color: ${props => props.$active ? '#667eea' : '#666'};
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #667eea;
  }
`;

const Main = styled.main`
  min-height: calc(100vh - 80px);
`;

const Footer = styled.footer`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: 4rem;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <>
      <Header>
        <Nav>
          <Logo to="/">
            <Brain size={32} />
            NeuroInk
          </Logo>
          <NavLinks>
            <NavLink to="/" $active={location.pathname === '/'}>
              <Home size={18} />
              Home
            </NavLink>
            <NavLink to="/dashboard" $active={location.pathname === '/dashboard'}>
              <Shield size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/about" $active={location.pathname === '/about'}>
              <Info size={18} />
              About
            </NavLink>
            <NavLink to="/contact" $active={location.pathname === '/contact'}>
              <Mail size={18} />
              Contact
            </NavLink>
          </NavLinks>
        </Nav>
      </Header>
      <Main>
        {children}
      </Main>
      <Footer>
        <p>&copy; 2025 NeuroInk. All rights reserved.</p>
        <p>Early detection saves lives. Get tested today.</p>
      </Footer>
    </>
  );
};

export default Layout;
