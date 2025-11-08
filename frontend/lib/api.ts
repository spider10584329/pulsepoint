import axios from 'axios'

// Get the base backend URL from environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Helper function to get the full backend URL
export const getBackendUrl = () => BACKEND_URL

// API base URL includes /api suffix for axios instance
const API_BASE_URL = `${BACKEND_URL}/api`

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)
