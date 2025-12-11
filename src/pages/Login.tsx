import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Brain, Mail, Lock, AlertCircle } from 'lucide-react';
import { consentService } from '../services/consentService';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 440px;
  margin: 0 auto;
  padding: 32px 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #64748b;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #334155;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 14px 14px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
  background: #f8fafc;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
  }

  &::placeholder {
    color: #cbd5e1;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
`;

const Button = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => (props.$loading ? 0.6 : 1)};
  pointer-events: ${props => (props.$loading ? 'none' : 'auto')};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: #94a3b8;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
`;

const LinkText = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #64748b;

  a {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Signed in successfully!');
      
      // Check if consent is accepted
      const consentAccepted = await consentService.isConsentAccepted();
      
      if (!consentAccepted) {
        // Redirect to welcome page first if consent is not accepted
        // User will then proceed to consent form from welcome page
        navigate('/welcome', { 
          replace: true
        });
      } else {
        // Navigate to intended destination if consent is already accepted
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage.includes('user-not-found') 
        ? 'No account found with this email address.'
        : errorMessage.includes('wrong-password')
        ? 'Incorrect password. Please try again.'
        : errorMessage.includes('invalid-email')
        ? 'Please enter a valid email address.'
        : 'Failed to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Logo>
            <Brain size={32} color="white" />
          </Logo>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to continue your cognitive assessment</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage>
              <AlertCircle size={18} />
              <span>{error}</span>
            </ErrorMessage>
          )}

          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <InputIcon>
                <Mail size={20} />
              </InputIcon>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <InputWrapper>
              <InputIcon>
                <Lock size={20} />
              </InputIcon>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </InputWrapper>
          </InputGroup>

          <Button type="submit" $loading={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        <Divider />

        <LinkText>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </LinkText>
      </Card>
    </Container>
  );
};

export default Login;


