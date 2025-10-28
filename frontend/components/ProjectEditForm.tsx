'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/lib/context/ToastContext'
import { Project } from './types'
import { ProjectFormData } from './ProjectRegistrationForm'

interface ProjectEditFormProps {
  project: Project | null
  onClose: () => void
  onProjectUpdated?: () => void
}

export default function ProjectEditForm({ project, onClose, onProjectUpdated }: ProjectEditFormProps) {
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

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        website: project.websiteLink,
        price: project.price,
        mprice: project.mprice,
        file: null
      })
    }
  }, [project])

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
    if (!project) return
    
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

      // Check if we need to upload a file or just update data
      let response
      if (formData.file) {
        // Create FormData for file upload
        const submitData = new FormData()
        submitData.append('id', project.id.toString())
        submitData.append('name', formData.name)
        submitData.append('description', formData.description)
        submitData.append('website', formData.website)
        submitData.append('price', formData.price)
        submitData.append('mprice', formData.mprice)
        submitData.append('file', formData.file)

        response = await fetch('http://localhost:5001/api/project/update', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: submitData
        })
      } else {
        // Send JSON data without file
        const submitData = {
          id: project.id,
          name: formData.name,
          description: formData.description,
          website: formData.website,
          price: formData.price,
          mprice: formData.mprice
        }

        response = await fetch('http://localhost:5001/api/project/update', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        })
      }

      const data = await response.json()

      if (response.ok && data.status === 1) {
        showToast('success', 'Success', 'Project updated successfully!')
        onClose()
        if (onProjectUpdated) {
          onProjectUpdated()
        }
      } else {
        showToast('error', 'Error', data.message || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      showToast('error', 'Error', 'Failed to update project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!project) return null

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Project</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="edit-description"
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
            <label htmlFor="edit-website" className="block text-sm font-medium text-gray-700 mb-2">
              Website Link
            </label>
            <input
              type="url"
              id="edit-website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <input
                type="number"
                id="edit-price"
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
              <label htmlFor="edit-mprice" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Price
              </label>
              <input
                type="number"
                id="edit-mprice"
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
            <label htmlFor="edit-file" className="block text-sm font-medium text-gray-700 mb-2">
              Update Image
            </label>
            <input
              type="file"
              id="edit-file"
              name="file"
              onChange={handleFileChange}
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none  file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Upload new image to replace current one</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-md  hover:bg-gray-900 focus:outline-none "
            >
              {isLoading ? 'Updating...' : 'Update Project'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
