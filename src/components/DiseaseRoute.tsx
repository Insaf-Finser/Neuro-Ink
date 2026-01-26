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
    
    // Update disease context if on awareness route
    if (path === '/alzheimers') {
      if (currentDisease !== 'alzheimers') {
        setDisease('alzheimers');
      }
      return;
    }
    if (path === '/parkinsons') {
      if (currentDisease !== 'parkinsons') {
        setDisease('parkinsons');
      }
      return;
    }
    
    // Skip if already disease-scoped or if it's a public route
    if (path.startsWith(`/${currentDisease}/`) || 
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
      const newPath = `/${currentDisease}${path}`;
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, currentDisease, navigate, setDisease]);

  return <>{children}</>;
};

