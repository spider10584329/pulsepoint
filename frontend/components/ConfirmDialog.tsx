'use client'

import { useState, useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  type = 'danger'
}: ConfirmDialogProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-red-600'
    }
  }

  const getIconSrc = () => {
    switch (type) {
      case 'danger':
        return '/svg/warning.svg'
      case 'warning':
        return '/svg/warning.svg'
      case 'info':
        return '/svg/notification.svg'
      default:
        return '/svg/warning.svg'
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-md w-full transform transition-transform duration-200 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center mb-3">
            <div className={`flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center ${getIconColor()} bg-gray-100`}>
              <img 
                src={getIconSrc()}
                alt={`${type} icon`}
                className="w-12 h-12"
                style={{ 
                  filter: type === 'danger' ? 'brightness(0) saturate(100%) invert(25%) sepia(91%) saturate(2463%) hue-rotate(350deg) brightness(96%) contrast(94%)' 
                    : type === 'warning' ? 'brightness(0) saturate(100%) invert(60%) sepia(73%) saturate(1808%) hue-rotate(24deg) brightness(101%) contrast(90%)'
                    : 'brightness(0) saturate(100%) invert(47%) sepia(82%) saturate(1164%) hue-rotate(200deg) brightness(98%) contrast(89%)'
                }}
              />
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none "
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none  transition-colors ${getButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
