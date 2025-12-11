import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Brain, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
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

const PasswordRequirements = styled.div`
  padding: 12px;
  background: #f1f5f9;
  border-radius: 10px;
  font-size: 13px;
  color: #475569;
`;

const Requirement = styled.div<{ $met?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: ${props => (props.$met ? '#059669' : '#64748b')};

  &:first-child {
    margin-top: 0;
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

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const passwordLengthOk = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = email.length > 0 && passwordLengthOk && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      toast.success('Account created successfully!');
      
      // New users must always accept consent
      // Redirect to welcome page first, then user proceeds to consent form
      navigate('/welcome', { 
        replace: true
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create account';
      setError(
        errorMessage.includes('email-already-in-use')
          ? 'An account with this email already exists. Please sign in instead.'
          : errorMessage.includes('invalid-email')
          ? 'Please enter a valid email address.'
          : errorMessage.includes('weak-password')
          ? 'Password is too weak. Please use a stronger password.'
          : 'Failed to create account. Please try again.'
      );
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
          <Title>Create Account</Title>
          <Subtitle>Start your cognitive assessment journey</Subtitle>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </InputWrapper>
            <PasswordRequirements>
              <Requirement $met={passwordLengthOk}>
                <CheckCircle size={14} />
                <span>At least 6 characters</span>
              </Requirement>
            </PasswordRequirements>
          </InputGroup>

          <InputGroup>
            <Label>Confirm Password</Label>
            <InputWrapper>
              <InputIcon>
                <Lock size={20} />
              </InputIcon>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </InputWrapper>
            {confirmPassword.length > 0 && (
              <Requirement $met={passwordsMatch}>
                <CheckCircle size={14} />
                <span>Passwords match</span>
              </Requirement>
            )}
          </InputGroup>

          <Button type="submit" $loading={loading} disabled={!canSubmit}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </Form>

        <Divider />

        <LinkText>
          Already have an account? <Link to="/login">Sign in</Link>
        </LinkText>
      </Card>
    </Container>
  );
};

export default Signup;


