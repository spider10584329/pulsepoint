'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { useToast } from '@/lib/context/ToastContext'

interface ProjectFormData {
  name: string
  description: string
  website: string
  price: string
  mprice: string
  file: File | null
}

function ProjectRegistrationForm({ onProjectCreated }: { onProjectCreated?: () => void }) {
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">Optional: Upload project image file</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gray-800 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creating Project...' : 'Create Project'}
      </button>
    </form>
  )
}

interface Project {
  id: number
  name: string
  description: string
  websiteLink: string
  price: string
  mprice: string
  filename: string
}

function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'No authentication token found')
        return
      }

      const response = await fetch('http://localhost:5001/api/project/read', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        showToast('error', 'Error', 'Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      showToast('error', 'Error', 'Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No projects found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.id} className="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 relative">
          {/* Action Buttons - Top Right Corner */}
          <div className="absolute top-2 right-2 z-10 flex space-x-1">
            {/* Edit Button */}
            <button className="p-1.5 sm:p-2 rounded-full bg-white shadow-sm hover:bg-blue-50 border border-gray-200 hover:border-blue-200">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {/* Delete Button */}
            <button className="p-1.5 sm:p-2 rounded-full bg-white shadow-sm hover:bg-red-50 border border-gray-200 hover:border-red-200">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row min-h-[120px] sm:h-36">
            {/* Project Image Display */}
            <div className="h-24 sm:h-36 w-full sm:w-32 md:w-40 lg:w-48 flex-shrink-0 flex items-center justify-center bg-gray-50">
              {project.filename ? (
                <img 
                  src={`http://localhost:5001/project/download?filepath=${project.filename}`}
                  alt={project.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Replace with SVG fallback if image fails to load
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.style.display = 'none';
                      const fallbackSvg = parent.querySelector('.fallback-svg');
                      if (fallbackSvg) {
                        (fallbackSvg as HTMLElement).style.display = 'flex';
                      }
                    }
                  }}
                />
              ) : null}
              
              {/* Fallback SVG - Always present but hidden by default when image exists */}
              <div className={`fallback-svg bg-gray-50 h-full w-full flex items-center justify-center ${project.filename ? 'hidden' : 'flex'}`}>
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg flex items-center justify-center bg-gray-100">
                  <img 
                    src="/svg/software.svg" 
                    alt="Software Project"
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                </div>
              </div>
            </div>
            
            {/* Text Content - Right Side */}
            <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-h-0">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base line-clamp-1">{project.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-2 sm:line-clamp-3">{project.description}</p>
              </div>
              
              <div className="mt-2">
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-1">
                  {project.price && (
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Price: ${project.price}
                    </span>
                  )}
                  {project.mprice && (
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Monthly: ${project.mprice}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  {project.websiteLink && (
                    <a 
                      href={project.websiteLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-800 truncate"
                    >
                      {project.websiteLink}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminSoftwarePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projectListKey, setProjectListKey] = useState(0)

  const refreshProjectList = () => {
    setProjectListKey(prev => prev + 1)
  }

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[0]}>
        <div className=" p-2 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Software Management
              </h1>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white rounded-lg shadow p-4 lg:p-6 h-[50vh] xl:h-[calc(100vh-240px)] min-h-[400px] overflow-hidden flex flex-col">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Project List</h2>
                  
                  <div className="flex-1 overflow-auto">
                    <ProjectList key={projectListKey} />
                  </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 lg:p-6 h-[50vh] xl:h-[calc(100vh-240px)] min-h-[400px] overflow-hidden flex flex-col">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Registration</h2>
                  
                  <div className="flex-1 overflow-auto">
                    <ProjectRegistrationForm onProjectCreated={refreshProjectList} />
                  </div>
              </div>
            </div>
          </div>
        </div>
    </AuthGuard>
  )
}
