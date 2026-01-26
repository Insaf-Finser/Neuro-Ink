import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import ConsentForm from './pages/ConsentForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import ClockDrawingTest from './pages/tests/ClockDrawingTest';
import WordRecallTest from './pages/tests/WordRecallTest';
import ImageAssociationTest from './pages/tests/ImageAssociationTest';
import SelectionMemoryTest from './pages/tests/SelectionMemoryTest';
import HandwritingTaskTest from './pages/tests/HandwritingTaskTest';
import CircleDrawingTest from './pages/tests/CircleDrawingTest';
import SquareDrawingTest from './pages/tests/SquareDrawingTest';
import TriangleDrawingTest from './pages/tests/TriangleDrawingTest';
import PentagonDrawingTest from './pages/tests/PentagonDrawingTest';
import SpiralDrawingTest from './pages/tests/SpiralDrawingTest';
import LetterCopyTest from './pages/tests/LetterCopyTest';
import WordMemoryTest from './pages/tests/WordMemoryTest';
import RepetitiveWritingTest from './pages/tests/RepetitiveWritingTest';
import DotConnectionTest from './pages/tests/DotConnectionTest';
import WordCopyTest from './pages/tests/WordCopyTest';
import NumberCopyTest from './pages/tests/NumberCopyTest';
import SentenceMemoryTest from './pages/tests/SentenceMemoryTest';
import SignaturePracticeTest from './pages/tests/SignaturePracticeTest';
import ComplexFigureCopyTest from './pages/tests/ComplexFigureCopyTest';
import LineTracingTest from './pages/tests/LineTracingTest';
import NameMemoryTest from './pages/tests/NameMemoryTest';
import NumberMemoryTest from './pages/tests/NumberMemoryTest';
import RapidWritingTest from './pages/tests/RapidWritingTest';
import ComprehensiveAssessmentTest from './pages/tests/ComprehensiveAssessmentTest';
import TaskSelection from './pages/TaskSelection';
import Results from './pages/Results';
import AIAnalysisResults from './pages/AIAnalysisResults';
import ComprehensiveResults from './pages/ComprehensiveResults';
import About from './pages/About';
import Contact from './pages/Contact';
import ModelDemo from './components/ModelDemo';
import RequireConsent from './components/RequireConsent';
import { DiseaseRouteRedirect } from './components/DiseaseRoute';
import DiseaseAwareness from './pages/DiseaseAwareness';
import ParkinsonsTaskSelection from './pages/parkinsons/ParkinsonsTaskSelection';
import ParkinsonsTest from './pages/parkinsons/ParkinsonsTest';

function App() {
  return (
    <Layout>
      <DiseaseRouteRedirect>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/consent" element={<ConsentForm />} />
          
          {/* Disease awareness routes */}
          <Route path="/alzheimers" element={<DiseaseAwareness disease="alzheimers" />} />
          <Route path="/parkinsons" element={<DiseaseAwareness disease="parkinsons" />} />
          
          {/* Parkinson's test routes (public, no PWA required, no analysis) */}
          <Route path="/parkinsons/tests" element={<ParkinsonsTaskSelection />} />
          <Route path="/parkinsons/test/:taskId" element={<ParkinsonsTest />} />
          
          {/* Old routes (will be redirected internally to disease-scoped routes) */}
          <Route path="/dashboard" element={<ProtectedRoute><RequireConsent><Dashboard /></RequireConsent></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><RequireConsent><TaskSelection /></RequireConsent></ProtectedRoute>} />
          
          {/* Disease-scoped routes (internal) */}
          <Route path="/alzheimers/dashboard" element={<ProtectedRoute><RequireConsent><Dashboard /></RequireConsent></ProtectedRoute>} />
          <Route path="/alzheimers/tasks" element={<ProtectedRoute><RequireConsent><TaskSelection /></RequireConsent></ProtectedRoute>} />
          {/* Old test routes (will be redirected internally) */}
          <Route path="/test/clock-drawing" element={<ProtectedRoute><ClockDrawingTest /></ProtectedRoute>} />
          <Route path="/test/word-recall" element={<ProtectedRoute><WordRecallTest /></ProtectedRoute>} />
          <Route path="/test/image-association" element={<ProtectedRoute><ImageAssociationTest /></ProtectedRoute>} />
          <Route path="/test/selection-memory" element={<ProtectedRoute><SelectionMemoryTest /></ProtectedRoute>} />
          {/* Individual task routes */}
          <Route path="/test/circle_drawing" element={<ProtectedRoute><CircleDrawingTest /></ProtectedRoute>} />
          <Route path="/test/square_drawing" element={<ProtectedRoute><SquareDrawingTest /></ProtectedRoute>} />
          <Route path="/test/triangle_drawing" element={<ProtectedRoute><TriangleDrawingTest /></ProtectedRoute>} />
          <Route path="/test/pentagon_drawing" element={<ProtectedRoute><PentagonDrawingTest /></ProtectedRoute>} />
          <Route path="/test/spiral_drawing" element={<ProtectedRoute><SpiralDrawingTest /></ProtectedRoute>} />
          <Route path="/test/letter_copy" element={<ProtectedRoute><LetterCopyTest /></ProtectedRoute>} />
          <Route path="/test/word_memory" element={<ProtectedRoute><WordMemoryTest /></ProtectedRoute>} />
          <Route path="/test/repetitive_writing" element={<ProtectedRoute><RepetitiveWritingTest /></ProtectedRoute>} />
          <Route path="/test/dot_connection" element={<ProtectedRoute><DotConnectionTest /></ProtectedRoute>} />
          <Route path="/test/word_copy" element={<ProtectedRoute><WordCopyTest /></ProtectedRoute>} />
          <Route path="/test/number_copy" element={<ProtectedRoute><NumberCopyTest /></ProtectedRoute>} />
          <Route path="/test/sentence_memory" element={<ProtectedRoute><SentenceMemoryTest /></ProtectedRoute>} />
          <Route path="/test/signature_practice" element={<ProtectedRoute><SignaturePracticeTest /></ProtectedRoute>} />
          <Route path="/test/complex_figure_copy" element={<ProtectedRoute><ComplexFigureCopyTest /></ProtectedRoute>} />
          <Route path="/test/line_tracing" element={<ProtectedRoute><LineTracingTest /></ProtectedRoute>} />
          <Route path="/test/name_memory" element={<ProtectedRoute><NameMemoryTest /></ProtectedRoute>} />
          <Route path="/test/number_memory" element={<ProtectedRoute><NumberMemoryTest /></ProtectedRoute>} />
          <Route path="/test/rapid_writing" element={<ProtectedRoute><RapidWritingTest /></ProtectedRoute>} />
          <Route path="/test/comprehensive_assessment" element={<ProtectedRoute><ComprehensiveAssessmentTest /></ProtectedRoute>} />
          
          {/* Catch-all route for any test accessed via /test/:taskId */}
          <Route path="/test/:taskId" element={<ProtectedRoute><HandwritingTaskTest /></ProtectedRoute>} />
          
          {/* Disease-scoped test routes (internal) */}
          <Route path="/alzheimers/test/clock-drawing" element={<ProtectedRoute><ClockDrawingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/word-recall" element={<ProtectedRoute><WordRecallTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/image-association" element={<ProtectedRoute><ImageAssociationTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/selection-memory" element={<ProtectedRoute><SelectionMemoryTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/circle_drawing" element={<ProtectedRoute><CircleDrawingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/square_drawing" element={<ProtectedRoute><SquareDrawingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/triangle_drawing" element={<ProtectedRoute><TriangleDrawingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/pentagon_drawing" element={<ProtectedRoute><PentagonDrawingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/spiral_drawing" element={<ProtectedRoute><SpiralDrawingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/letter_copy" element={<ProtectedRoute><LetterCopyTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/word_memory" element={<ProtectedRoute><WordMemoryTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/repetitive_writing" element={<ProtectedRoute><RepetitiveWritingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/dot_connection" element={<ProtectedRoute><DotConnectionTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/word_copy" element={<ProtectedRoute><WordCopyTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/number_copy" element={<ProtectedRoute><NumberCopyTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/sentence_memory" element={<ProtectedRoute><SentenceMemoryTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/signature_practice" element={<ProtectedRoute><SignaturePracticeTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/complex_figure_copy" element={<ProtectedRoute><ComplexFigureCopyTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/line_tracing" element={<ProtectedRoute><LineTracingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/name_memory" element={<ProtectedRoute><NameMemoryTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/number_memory" element={<ProtectedRoute><NumberMemoryTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/rapid_writing" element={<ProtectedRoute><RapidWritingTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/comprehensive_assessment" element={<ProtectedRoute><ComprehensiveAssessmentTest /></ProtectedRoute>} />
          <Route path="/alzheimers/test/:taskId" element={<ProtectedRoute><HandwritingTaskTest /></ProtectedRoute>} />
          
          <Route path="/results" element={<ProtectedRoute><RequireConsent><Results /></RequireConsent></ProtectedRoute>} />
          <Route path="/ai-analysis" element={<ProtectedRoute><RequireConsent><AIAnalysisResults /></RequireConsent></ProtectedRoute>} />
          <Route path="/comprehensive-results" element={<ProtectedRoute><RequireConsent><ComprehensiveResults /></RequireConsent></ProtectedRoute>} />
          
          {/* Disease-scoped results routes (internal) */}
          <Route path="/alzheimers/results" element={<ProtectedRoute><RequireConsent><Results /></RequireConsent></ProtectedRoute>} />
          <Route path="/alzheimers/ai-analysis" element={<ProtectedRoute><RequireConsent><AIAnalysisResults /></RequireConsent></ProtectedRoute>} />
          <Route path="/alzheimers/comprehensive-results" element={<ProtectedRoute><RequireConsent><ComprehensiveResults /></RequireConsent></ProtectedRoute>} />
          <Route path="/model-demo" element={<ModelDemo />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </DiseaseRouteRedirect>
    </Layout>
  );
}

export default App;
