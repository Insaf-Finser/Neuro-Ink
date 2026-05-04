import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDisease } from '../context/DiseaseContext';

/**
 * Component that handles disease-aware routing
 * Redirects old routes to disease-scoped routes internally
 */
export const DiseaseRouteRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentDisease, setDisease } = useDisease();

  useEffect(() => {
    const path = location.pathname;
    // Important: don't rely on `currentDisease` inside this effect for decisions
    // immediately after calling `setDisease` (state updates are async). Instead,
    // derive an "effective" disease from the URL when possible.
    const diseaseFromPath =
      path.startsWith('/alzheimers') ? 'alzheimers' :
      path.startsWith('/parkinsons') ? 'parkinsons' :
      null;
    const effectiveDisease = diseaseFromPath ?? currentDisease;
    
    // Keep disease in sync with URL so dashboard/tasks always match the disease in the path
    if (path.startsWith('/alzheimers')) {
      if (currentDisease !== 'alzheimers') {
        setDisease('alzheimers');
      }
      // If this is a Parkinson's-only route we shouldn't be here; otherwise continue for redirect logic
    }
    if (path.startsWith('/parkinsons')) {
      if (currentDisease !== 'parkinsons') {
        setDisease('parkinsons');
      }
    }
    
    // Skip if already disease-scoped or if it's a public route
    if (path.startsWith(`/${effectiveDisease}/`) || 
        path === '/' || 
        path === '/login' || 
        path === '/signup' || 
        path === '/welcome' || 
        path === '/consent' ||
        path === '/about' ||
        path === '/contact' ||
        path === '/model-demo') {
      return;
    }

    // Redirect old protected routes to disease-scoped routes
    const protectedRoutes = [
      '/dashboard',
      '/tasks',
      '/results',
      '/ai-analysis',
      '/comprehensive-results',
      '/test/'
    ];

    const isProtectedRoute = protectedRoutes.some(route => 
      path === route || path.startsWith(route)
    );

    if (isProtectedRoute) {
      const newPath = `/${effectiveDisease}${path}`;
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, currentDisease, navigate, setDisease]);

  return <>{children}</>;
};

