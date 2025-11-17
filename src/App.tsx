import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import ConsentForm from './pages/ConsentForm';
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
import { HANDWRITING_TASKS } from './data/handwritingTasks';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/consent" element={<ConsentForm />} />
        <Route path="/tasks" element={<RequireConsent><TaskSelection /></RequireConsent>} />
        <Route path="/test/clock-drawing" element={<RequireConsent><ClockDrawingTest /></RequireConsent>} />
        <Route path="/test/word-recall" element={<RequireConsent><WordRecallTest /></RequireConsent>} />
        <Route path="/test/image-association" element={<RequireConsent><ImageAssociationTest /></RequireConsent>} />
        <Route path="/test/selection-memory" element={<RequireConsent><SelectionMemoryTest /></RequireConsent>} />
        {/* Individual task routes */}
        <Route path="/test/circle_drawing" element={<RequireConsent><CircleDrawingTest /></RequireConsent>} />
        <Route path="/test/square_drawing" element={<RequireConsent><SquareDrawingTest /></RequireConsent>} />
        <Route path="/test/triangle_drawing" element={<RequireConsent><TriangleDrawingTest /></RequireConsent>} />
        <Route path="/test/pentagon_drawing" element={<RequireConsent><PentagonDrawingTest /></RequireConsent>} />
        <Route path="/test/spiral_drawing" element={<RequireConsent><SpiralDrawingTest /></RequireConsent>} />
        <Route path="/test/letter_copy" element={<RequireConsent><LetterCopyTest /></RequireConsent>} />
        <Route path="/test/word_memory" element={<RequireConsent><WordMemoryTest /></RequireConsent>} />
        <Route path="/test/repetitive_writing" element={<RequireConsent><RepetitiveWritingTest /></RequireConsent>} />
        <Route path="/test/dot_connection" element={<RequireConsent><DotConnectionTest /></RequireConsent>} />
        <Route path="/test/word_copy" element={<RequireConsent><WordCopyTest /></RequireConsent>} />
        <Route path="/test/number_copy" element={<RequireConsent><NumberCopyTest /></RequireConsent>} />
        <Route path="/test/sentence_memory" element={<RequireConsent><SentenceMemoryTest /></RequireConsent>} />
        <Route path="/test/signature_practice" element={<RequireConsent><SignaturePracticeTest /></RequireConsent>} />
        <Route path="/test/complex_figure_copy" element={<RequireConsent><ComplexFigureCopyTest /></RequireConsent>} />
        <Route path="/test/line_tracing" element={<RequireConsent><LineTracingTest /></RequireConsent>} />
        <Route path="/test/name_memory" element={<RequireConsent><NameMemoryTest /></RequireConsent>} />
        <Route path="/test/number_memory" element={<RequireConsent><NumberMemoryTest /></RequireConsent>} />
        <Route path="/test/rapid_writing" element={<RequireConsent><RapidWritingTest /></RequireConsent>} />
        <Route path="/test/comprehensive_assessment" element={<RequireConsent><ComprehensiveAssessmentTest /></RequireConsent>} />
        
        {/* Generic route for remaining tasks */}
        {HANDWRITING_TASKS.filter(task => 
          !['circle_drawing', 'square_drawing', 'triangle_drawing', 'pentagon_drawing', 'spiral_drawing', 'letter_copy', 'word_memory', 'repetitive_writing', 'dot_connection', 'word_copy', 'number_copy', 'sentence_memory', 'signature_practice', 'complex_figure_copy', 'line_tracing', 'name_memory', 'number_memory', 'rapid_writing', 'comprehensive_assessment'].includes(task.id)
        ).map(task => {
          console.log('App.tsx - Registering generic route for task:', task.id, 'path:', `/test/${task.id}`);
          return (
            <Route 
              key={task.id} 
              path={`/test/${task.id}`} 
              element={<RequireConsent><HandwritingTaskTest /></RequireConsent>} 
            />
          );
                  })}
                  <Route path="/results" element={<Results />} />
                  <Route path="/ai-analysis" element={<AIAnalysisResults />} />
                  <Route path="/comprehensive-results" element={<ComprehensiveResults />} />
                  <Route path="/model-demo" element={<ModelDemo />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
      </Routes>
    </Layout>
  );
}

export default App;
