import axios from 'axios'

// Use Vercel proxy in production, local Vite proxy in development
const getBaseURL = () => {
  // In development, use empty base URL so /api paths work with Vite proxy
  // Vite proxy is configured to forward /api/* to localhost:5000
  if (import.meta.env.DEV) {
    return ''
  }
  // In production (Vercel), use the Vercel serverless proxy
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

