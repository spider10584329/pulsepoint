'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import ProjectRegistrationForm from '@/components/admin/software/ProjectRegistrationForm'
import ProjectEditForm from '@/components/admin/software/ProjectEditForm'
import ProjectList from '@/components/admin/software/ProjectList'
import { Project } from '@/types/admin/types'

export default function AdminSoftwarePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projectListKey, setProjectListKey] = useState(0)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const refreshProjectList = () => {
    setProjectListKey(prev => prev + 1)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const handleCloseEdit = () => {
    setEditingProject(null)
  }

  const handleProjectUpdated = () => {
    refreshProjectList()
    setEditingProject(null)
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
                    <ProjectList key={projectListKey} onEditProject={handleEditProject} />
                  </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 lg:p-6 h-[50vh] xl:h-[calc(100vh-240px)] min-h-[400px] overflow-hidden flex flex-col">
                  {editingProject ? (
                    <ProjectEditForm 
                      project={editingProject} 
                      onClose={handleCloseEdit}
                      onProjectUpdated={handleProjectUpdated}
                    />
                  ) : (
                    <>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Registration</h2>
                      
                      <div className="flex-1 overflow-auto">
                        <ProjectRegistrationForm onProjectCreated={refreshProjectList} />
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
    </AuthGuard>
  )
}
