'use client'

import { useState, useEffect, useRef } from 'react'



interface Option {
  value: string | number
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option",
  disabled = false,
  className = ""
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update dropdown position on scroll/resize when open
  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const { position, style } = calculateDropdownPosition()
      setDropdownPosition(position as 'down' | 'up')
      setDropdownStyle(style)
    }

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])



  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return { position: 'down', style: {} }
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 200 // Approximate max height of dropdown
    
    const spaceBelow = viewportHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    
    let position: 'down' | 'up' = 'down'
    let style: React.CSSProperties = {}
    
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      position = 'up'
      style = {
        position: 'fixed',
        top: buttonRect.top - dropdownHeight - 4,
        left: buttonRect.left,
        width: buttonRect.width,
        zIndex: 9999
      }
    } else {
      position = 'down'
      style = {
        position: 'fixed',
        top: buttonRect.bottom + 4,
        left: buttonRect.left,
        width: buttonRect.width,
        zIndex: 9999
      }
    }
    
    return { position, style }
  }

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        const { position, style } = calculateDropdownPosition()
        setDropdownPosition(position as 'down' | 'up')
        setDropdownStyle(style)
      }
      setIsOpen(!isOpen)
    }
  }

  const handleOptionSelect = (optionValue: string | number) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === value)
  const displayText = selectedOption ? selectedOption.label : placeholder

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative w-full bg-white border border-gray-400 rounded-md px-4 py-2 text-left cursor-pointer text-sm
          hover:border-gray-500 transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          ${isOpen ? 'border-blue-500' : ''}
        `}
      >
        <div className="flex items-center">
          <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {displayText}
          </span>
        </div>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && !disabled && (
        <div 
          className="bg-white shadow-lg rounded-md border border-gray-300 overflow-hidden"
          style={dropdownStyle}
        >
          <div className="max-h-48 overflow-y-auto p-1">
            {/* Clear Selection Option */}
            <button
              type="button"
              onClick={() => handleOptionSelect('')}
              className="w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 transition-colors duration-150 text-sm"
            >
              <div className="flex items-center justify-between text-gray-400 hover:text-gray-600">
                <span>Clear Selection</span>
                <div className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center">
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>                
              </div>
            </button>

            {/* Options */}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option.value)}
                className="w-full px-3 py-2 text-left rounded-sm hover:bg-gray-100 transition-colors duration-150 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="truncate text-gray-900">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <div className="flex-shrink-0 text-blue-600">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
