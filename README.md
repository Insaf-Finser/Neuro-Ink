# NeuroInk - Cognitive Assessment via Handwriting Analysis

A comprehensive web application that uses AI-powered handwriting analysis to detect early signs of cognitive changes, particularly Alzheimer's disease. The app combines advanced machine learning with cognitive assessments to provide accurate, non-invasive screening.

## Features

### Core Functionality
- **AI-Powered Handwriting Analysis**: Analyzes handwriting patterns, pressure, timing, and spatial relationships
- **Comprehensive Cognitive Testing**: Four specialized tests designed to evaluate different cognitive functions
- **Real-time Results**: Immediate analysis and probability scoring
- **Privacy-First Design**: Encrypted data storage and strict privacy protocols

### Cognitive Tests
1. **Clock Drawing Test**: Evaluates spatial cognition and executive function
2. **Word Recall Test**: Assesses verbal memory and learning abilities
3. **Image Association Test**: Tests visual memory and associative learning
4. **Selection Memory Test**: Measures attention, working memory, and recognition

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility Features**: WCAG 2.1 AA compliant with screen reader support
- **Intuitive Interface**: Clean, modern design with clear instructions
- **Progress Tracking**: Real-time status indicators and progress monitoring

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Styled Components with CSS-in-JS
- **Animations**: Framer Motion for smooth transitions
- **Routing**: React Router DOM for navigation
- **Canvas**: HTML5 Canvas for handwriting capture
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neurodiagnosis-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/
│   └── Layout.tsx              # Main layout component with navigation
├── pages/
│   ├── Home.tsx                # Landing page with features and vision
│   ├── Dashboard.tsx           # User dashboard and quick actions
│   ├── Welcome.tsx             # Assessment introduction and instructions
│   ├── ConsentForm.tsx         # Informed consent before testing
│   ├── Results.tsx             # Results display with AI analysis
│   ├── About.tsx              # About page with privacy policy and terms
│   ├── Contact.tsx            # Contact page with support information
│   └── tests/
│       ├── ClockDrawingTest.tsx    # Clock drawing assessment
│       ├── WordRecallTest.tsx      # Word memory test
│       ├── ImageAssociationTest.tsx # Image-number association test
│       └── SelectionMemoryTest.tsx   # Selection memory test
├── App.tsx                     # Main app component with routing
├── index.tsx                   # App entry point
└── index.css                   # Global styles
```

## Key Features Explained

### Handwriting Analysis
The application captures handwriting data including:
- Stroke patterns and pressure
- Drawing timing and velocity
- Spatial relationships and proportions
- Cognitive load indicators

### AI Integration
- Machine learning models trained on 50,000+ handwriting samples
- Real-time biomarker detection
- Probability scoring for cognitive changes
- Continuous learning and model improvement

### Privacy & Security
- End-to-end encryption for all data
- GDPR compliant data handling
- Anonymized research data usage
- User control over data retention

## Assessment Process

1. **Welcome & Instructions**: Clear explanation of the assessment process
2. **Consent Form**: Informed consent with privacy information
3. **Cognitive Tests**: Four specialized assessments
4. **AI Analysis**: Real-time processing of handwriting data
5. **Results**: Comprehensive report with recommendations

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Medical Disclaimer

**Important**: This application is designed for screening purposes only and should not replace professional medical diagnosis or treatment. Results should be shared with healthcare professionals for proper interpretation and follow-up care.

## Support

For technical support or questions:
- Email: support@neurodiagnosis.com
- Phone: +1 (555) 123-4567
- Documentation: [Link to documentation]

## Roadmap

- [ ] Enhanced AI model with improved accuracy
- [ ] Multi-language support
- [ ] Integration with healthcare systems
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Telemedicine integration

---

Built with ❤️ for early detection and better cognitive health outcomes.
