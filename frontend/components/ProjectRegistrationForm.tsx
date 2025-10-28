'use client'

import { useState } from 'react'
import { useToast } from '@/lib/context/ToastContext'

export interface ProjectFormData {
  name: string
  description: string
  website: string
  price: string
  mprice: string
  file: File | null
}

interface ProjectRegistrationFormProps {
  onProjectCreated?: () => void
}

export default function ProjectRegistrationForm({ onProjectCreated }: ProjectRegistrationFormProps) {
  const { showToast } = useToast()
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    website: '',
    price: '',
    mprice: '',
    file: null
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      file
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'No authentication token found')
        return
      }

      // Validate required fields
      if (!formData.name || !formData.description) {
        showToast('error', 'Validation Error', 'Name and description are required')
        return
      }

      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('website', formData.website)
      submitData.append('price', formData.price)
      submitData.append('mprice', formData.mprice)
      
      if (formData.file) {
        submitData.append('file', formData.file)
      }

      const response = await fetch('http://localhost:5001/api/project/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      })

      const data = await response.json()

      if (response.ok && data.status === 1) {
        showToast('success', 'Success', 'Project created successfully!')
        // Reset form
        setFormData({
          name: '',
          description: '',
          website: '',
          price: '',
          mprice: '',
          file: null
        })
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // Trigger refresh of project list
        if (onProjectCreated) {
          onProjectCreated()
        }
      } else {
        showToast('error', 'Error', data.message || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      showToast('error', 'Error', 'Failed to create project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
          placeholder="Enter project name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
          placeholder="Enter project description"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
          Website Link
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="mprice" className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Price
          </label>
          <input
            type="number"
            id="mprice"
            name="mprice"
            value={formData.mprice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
          Image file
        </label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleFileChange}
          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none  file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">Optional: Upload project image file</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gray-800 text-white py-2 px-4 rounded-md  hover:bg-gray-900 focus:outline-none  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creating Project...' : 'Create Project'}
      </button>
    </form>
  )
}
