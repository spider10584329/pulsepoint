'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

interface User {
  id: number
  company: string
  hotelname: string
  firstname: string
  lastname: string
  phonenumber: string
  email: string
  address: string
  contact: string
  status: number
  isVerify: number
  role: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await api.post('/auth/verify-token')
        setUser(response.data.user)
      }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { access_token, user } = response.data
    
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }, [])

  const register = React.useCallback(async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    const { access_token, user_id } = response.data
    
    localStorage.setItem('token', access_token)
    // After registration, get user data by verifying token
    await checkAuth()
  }, [checkAuth])

  const logout = React.useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateProfile = React.useCallback(async (userData: Partial<User>) => {
    await api.put('/user/profile', userData)
    // Refresh user data after update
    await checkAuth()
  }, [checkAuth])

  const value = React.useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }), [user, loading, login, register, logout, updateProfile])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
