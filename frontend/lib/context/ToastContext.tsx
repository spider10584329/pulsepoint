'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import Toast, { ToastMessage, ToastType } from '../../components/Toast'

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = React.useCallback((type: ToastType, title: string, message: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const contextValue = React.useMemo(() => ({
    showToast,
    removeToast
  }), [showToast, removeToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 z-50 space-y-2"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
