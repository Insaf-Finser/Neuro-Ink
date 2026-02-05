/**
 * Determines if a route requires PWA install (standalone mode)
 * Both Alzheimer's and Parkinson's assessment routes require PWA install
 * 
 * Routes that require PWA:
 * - /alzheimers/dashboard
 * - /alzheimers/tasks
 * - /alzheimers/test/* (all test routes)
 * - /alzheimers/results
 * - /alzheimers/ai-analysis
 * - /alzheimers/comprehensive-results
 * - /parkinsons/assessment-test/* (Parkinson's assessment routes)
 * - /parkinsons/assessment-results
 * - Old routes that redirect to Alzheimer's test routes:
 *   - /dashboard
 *   - /tasks
 *   - /test/*
 *   - /results
 *   - /ai-analysis
 *   - /comprehensive-results
 * 
 * Routes that do NOT require PWA:
 * - /parkinsons/tests (Parkinson's test selection - UI only)
 * - /parkinsons/test/* (Parkinson's test pages - UI only, no analysis)
 */
export function routeRequiresPWA(pathname: string): boolean {
  // Explicitly exclude Parkinson's prototype test routes (they don't require PWA)
  if (pathname.startsWith('/parkinsons/test') || pathname === '/parkinsons/tests') {
    return false;
  }

  // Routes that require PWA install (Alzheimer's test routes AND Parkinson's assessment routes)
  const pwaRequiredRoutes = [
    '/alzheimers/dashboard',
    '/alzheimers/tasks',
    '/alzheimers/results',
    '/alzheimers/ai-analysis',
    '/alzheimers/comprehensive-results',
    '/alzheimers/test/',
    '/parkinsons/assessment-test/',
    '/parkinsons/assessment-results',
    // Old routes that redirect to Alzheimer's test routes
    '/dashboard',
    '/tasks',
    '/test/',
    '/results',
    '/ai-analysis',
    '/comprehensive-results',
  ];

  // Check if path matches any PWA-required route
  const requiresPWA = pwaRequiredRoutes.some(route => {
    if (route.endsWith('/')) {
      // For routes ending with /, check if pathname starts with it
      return pathname.startsWith(route);
    }
    // Exact match for specific routes
    return pathname === route || pathname.startsWith(route + '/');
  });

  return requiresPWA;
}

