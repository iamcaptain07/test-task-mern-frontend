import axios from 'axios'

// Use Vercel proxy in production, direct backend URL in development
const getBaseURL = () => {
  // In development, use the backend URL directly or localhost
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000'
  }
  // In production (Vercel), use the proxy
  return '/api/backend-proxy'
}

// Configure axios with base URL
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

