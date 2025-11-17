import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  HelpCircle,
  Shield,
  Users
} from 'lucide-react';

const ContactContainer = styled.div`
  padding: 60px 0;
  min-height: calc(100vh - 160px);
`;

const ContactHeader = styled.div`
  text-align: center;
  margin-bottom: 64px;
`;

const ContactTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 24px;
`;

const ContactSubtitle = styled.p`
  font-size: 1.3rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContactContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const ContactInfo = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const ContactForm = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 2px solid #e8ecff;
`;

const ContactIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ContactDetails = styled.div`
  flex: 1;
`;

const ContactLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ContactValue = styled.div`
  color: #666;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e8ecff;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 2px solid #e8ecff;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SupportSection = styled.div`
  background: #f8f9ff;
  border: 2px solid #e8ecff;
  border-radius: 16px;
  padding: 32px;
  margin-top: 32px;
`;

const SupportTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SupportList = styled.ul`
  list-style: none;
  padding: 0;
`;

const SupportItem = styled.li`
  color: #666;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0;
    color: #667eea;
    font-weight: bold;
  }
`;

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We will get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <ContactContainer>
      <div className="container">
        <ContactHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ContactTitle>Contact Us</ContactTitle>
            <ContactSubtitle>
              Have questions about NeuroInk? We're here to help. Reach out to our support team 
              for assistance with assessments, technical issues, or general inquiries.
            </ContactSubtitle>
          </motion.div>
        </ContactHeader>

        <ContactContent>
          <ContactInfo>
            <SectionTitle>
              <MessageCircle size={32} />
              Get in Touch
            </SectionTitle>

            <ContactItem>
              <ContactIcon>
                <Mail size={24} />
              </ContactIcon>
              <ContactDetails>
                <ContactLabel>Email Support</ContactLabel>
                <ContactValue>support@neurodiagnosis.com</ContactValue>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <ContactIcon>
                <Phone size={24} />
              </ContactIcon>
              <ContactDetails>
                <ContactLabel>Phone Support</ContactLabel>
                <ContactValue>+1 (555) 123-4567</ContactValue>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <ContactIcon>
                <MapPin size={24} />
              </ContactIcon>
              <ContactDetails>
                <ContactLabel>Office Address</ContactLabel>
                <ContactValue>
                  123 Healthcare Drive<br />
                  Medical District, MD 12345<br />
                  United States
                </ContactValue>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <ContactIcon>
                <Clock size={24} />
              </ContactIcon>
              <ContactDetails>
                <ContactLabel>Support Hours</ContactLabel>
                <ContactValue>
                  Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                  Saturday: 10:00 AM - 4:00 PM EST<br />
                  Sunday: Closed
                </ContactValue>
              </ContactDetails>
            </ContactItem>

            <SupportSection>
              <SupportTitle>
                <HelpCircle size={20} />
                Common Support Topics
              </SupportTitle>
              <SupportList>
                <SupportItem>Technical issues with assessments</SupportItem>
                <SupportItem>Understanding your results</SupportItem>
                <SupportItem>Account and privacy questions</SupportItem>
                <SupportItem>Healthcare provider referrals</SupportItem>
                <SupportItem>Research participation inquiries</SupportItem>
                <SupportItem>Accessibility accommodations</SupportItem>
              </SupportList>
            </SupportSection>
          </ContactInfo>

          <ContactForm>
            <SectionTitle>
              <Send size={32} />
              Send us a Message
            </SectionTitle>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="What is this about?"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="message">Message *</Label>
                <TextArea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Please describe your question or concern in detail..."
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                <Send size={20} />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </SubmitButton>
            </form>

            <div style={{ marginTop: '32px', padding: '24px', background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Shield size={20} color="#059669" />
                <strong style={{ color: '#059669' }}>Privacy Notice</strong>
              </div>
              <p style={{ color: '#065f46', fontSize: '0.9rem', margin: 0 }}>
                Your message and personal information are encrypted and secure. We will only use 
                your contact information to respond to your inquiry and will never share it with 
                third parties.
              </p>
            </div>
          </ContactForm>
        </ContactContent>
      </div>
    </ContactContainer>
  );
};

export default Contact;
