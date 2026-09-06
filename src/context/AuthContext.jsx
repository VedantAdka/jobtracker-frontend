import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialized straight from localStorage, so a page refresh doesn't log you out.
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const persistSession = (data) => {
    const currentUser = { fullName: data.fullName, email: data.email }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(currentUser))
    setToken(data.token)
    setUser(currentUser)
  }

  const login = async (email, password) => {
    const data = await loginUser({ email, password })
    persistSession(data)
  }

  const register = async (fullName, email, password) => {
    const data = await registerUser({ fullName, email, password })
    persistSession(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
