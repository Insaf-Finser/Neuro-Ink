import React, { useEffect, useRef } from 'react';
import TaskSelection from '../pages/TaskSelection';

interface FlowTaskSelectionProps {
  onTaskSelect: (taskId: string) => void;
  onViewResults: () => void;
}

const FlowTaskSelection: React.FC<FlowTaskSelectionProps> = ({ onTaskSelect, onViewResults }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Intercept clicks on task links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/test/"]');
      
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const href = link.getAttribute('href');
        if (href) {
          const taskId = href.replace('/test/', '');
          onTaskSelect(taskId);
        }
        return false;
      }

      // Check for results link
      const resultsLink = target.closest('a[href="/results"], a[href="/ai-analysis"], a[href="/comprehensive-results"]');
      if (resultsLink) {
        e.preventDefault();
        e.stopPropagation();
        onViewResults();
        return false;
      }
    };

    container.addEventListener('click', handleClick, true);
    return () => {
      container.removeEventListener('click', handleClick, true);
    };
  }, [onTaskSelect, onViewResults]);

  return (
    <div ref={containerRef}>
      <TaskSelection />
    </div>
  );
};

export default FlowTaskSelection;
