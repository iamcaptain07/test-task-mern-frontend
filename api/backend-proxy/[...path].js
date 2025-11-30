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
    
    // Extract the path from the catch-all parameter
    // In Vercel, req.query.path will be an array of path segments
    const pathSegments = req.query.path || [];
    const path = '/' + pathSegments.join('/');
    
    // Handle query string
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    
    // Build the full URL
    const url = `${backendUrl}${path}${queryString}`;

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

