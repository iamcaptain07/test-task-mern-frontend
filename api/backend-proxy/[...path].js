// /api/backend-proxy/[...path].js - Catch-all route for Vercel
export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    // Forward the request to your EB backend
    const backendUrl = 'http://backend-env.eba-drmctxck.eu-north-1.elasticbeanstalk.com';
    
    // Extract the path from the catch-all route
    // In Vercel, for /api/backend-proxy/api/auth/signin
    // req.query.path will be ['api', 'auth', 'signin']
    let path = '/';
    
    // Get path from catch-all route parameter
    if (req.query && req.query.path) {
      const pathSegments = Array.isArray(req.query.path) 
        ? req.query.path 
        : typeof req.query.path === 'string'
        ? req.query.path.split('/').filter(Boolean)
        : [];
      
      if (pathSegments.length > 0) {
        path = '/' + pathSegments.join('/');
      }
    }
    
    // If no path from query, try to parse from URL
    if (path === '/' && req.url) {
      const urlPath = req.url.split('?')[0];
      // Remove /api/backend-proxy prefix
      const cleanPath = urlPath.replace(/^\/api\/backend-proxy\/?/, '');
      path = cleanPath ? '/' + cleanPath : '/';
    }
    
    // Handle query string - preserve original query params
    const queryString = req.url && req.url.includes('?') 
      ? '?' + req.url.split('?')[1] 
      : '';
    
    // Build the full URL
    const url = `${backendUrl}${path}${queryString}`;
    
    // Log for debugging (remove in production if needed)
    console.log('Proxy request:', {
      method: req.method,
      originalUrl: req.url,
      query: req.query,
      extractedPath: path,
      targetUrl: url
    });

    // Prepare headers for the backend request
    const headers = {};
    
    // Forward Content-Type if present
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }
    
    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Prepare request body
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // Make the request to the backend
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body,
    });

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      res.setHeader('Content-Type', 'application/json');
      res.status(response.status).json(data);
    } else {
      data = await response.text();
      res.status(response.status).send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ message: 'Proxy error', error: error.message });
  }
}

