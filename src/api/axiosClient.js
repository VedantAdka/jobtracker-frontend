import axios from 'axios'

// Every request from anywhere in the app goes through this one instance.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

// Runs before every outgoing request - attaches the JWT automatically,
// so individual components never have to think about the auth header.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosClient
