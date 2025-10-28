'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/lib/context/ToastContext'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Project } from '../../../types/admin/types'

interface ProjectListProps {
  onEditProject?: (project: Project) => void
}

export default function ProjectList({ onEditProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
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

  const deleteProject = (projectId: number, projectName: string) => {
    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
      onConfirm: () => performDeleteProject(projectId, projectName)
    })
  }

  const performDeleteProject = async (projectId: number, projectName: string) => {
    // Close the confirmation dialog
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    setDeletingId(projectId)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'No authentication token found')
        return
      }

      const response = await fetch(`http://localhost:5001/api/project/delete?id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Remove the project from the local state
        setProjects(prev => prev.filter(p => p.id !== projectId))
        showToast('success', 'Project Deleted', `Project "${projectName}" has been deleted successfully!`)
      } else {
        showToast('error', 'Delete Failed', 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      showToast('error', 'Delete Error', 'An unexpected error occurred while deleting the project')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
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
    <>
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 relative">
            {/* Action Buttons - Top Right Corner */}
            <div className="absolute top-2 right-2 z-10 flex space-x-1">
              {/* Edit Button */}
              <button 
                onClick={() => onEditProject && onEditProject(project)}
                className="p-1.5 sm:p-2 rounded-full bg-white shadow-sm hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              {/* Delete Button */}
              <button 
                onClick={() => deleteProject(project.id, project.name)}
                disabled={deletingId === project.id}
                className="p-1.5 sm:p-2 rounded-full bg-white shadow-sm hover:bg-red-50 border border-gray-200 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === project.id ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600"></div>
                ) : (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
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
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleCloseConfirmDialog}
        type="danger"
      />
    </>
  )
}
