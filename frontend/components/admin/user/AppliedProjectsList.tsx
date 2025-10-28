'use client'

interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  company: string
  hotelname: string
  status: number
  isVerify: number
  role: number
}

interface AppliedProject {
  id: number
  userId: number
  projectId: number
  projectName: string
  isApply: number
  applyDate: string
  purchaseDate?: string
  filename?: string
  periodicity?: number
}

interface ProjectSubscriber {
  userId: number
  applyDate: string
  isApply: number
  periodicity?: number
}

interface UniqueProject {
  projectId: number
  projectName: string
  totalSubscribers: number
  subscribers: ProjectSubscriber[]
}

interface AppliedProjectsListProps {
  appliedProjects: AppliedProject[]
  selectedUserId: number | null
  users: User[]
  onClearSelection: () => void
  onConfigureProject?: (projectId: number, userId?: number) => void
}

export default function AppliedProjectsList({ 
  appliedProjects, 
  selectedUserId, 
  users, 
  onClearSelection,
  onConfigureProject
}: AppliedProjectsListProps) {
  
  const getUniqueAppliedProjects = (): UniqueProject[] => {
    const uniqueProjects = new Map<number, UniqueProject>()
    appliedProjects.forEach(project => {
      if (!uniqueProjects.has(project.projectId)) {
        uniqueProjects.set(project.projectId, {
          projectId: project.projectId,
          projectName: project.projectName,
          totalSubscribers: 1,
          subscribers: [{ userId: project.userId, applyDate: project.applyDate, isApply: project.isApply, periodicity: project.periodicity }]
        })
      } else {
        const existing = uniqueProjects.get(project.projectId)!
        existing.totalSubscribers++
        existing.subscribers.push({ userId: project.userId, applyDate: project.applyDate, isApply: project.isApply, periodicity: project.periodicity })
      }
    })
    return Array.from(uniqueProjects.values())
  }

  const getUserSpecificProjects = (userId: number) => {  
    const filtered = appliedProjects.filter(project => project.userId === userId)    
    return filtered
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            Applied List
          </h2>
          {selectedUserId && (
            <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
              {users.find(u => u.id === selectedUserId)?.email}
            </p>
          )}
        </div>
        {selectedUserId && (
          <button
            onClick={onClearSelection}
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap flex-shrink-0"
          >
            Show All Projects
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        {appliedProjects.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <img 
                  src="/svg/software.svg" 
                  alt="No projects"
                  className="w-6 h-6 sm:w-8 sm:h-8 opacity-50"
                />
              </div>
              <p className="text-sm sm:text-base">No applied projects found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {selectedUserId ? (
              // Show projects for specific user
              getUserSpecificProjects(selectedUserId).map((project) => (
                <div key={`${project.userId}-${project.projectId}`} className="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex flex-col lg:flex-row">
                    {/* Project Image Display */}
                    <div className="h-48 sm:h-56 lg:h-32 xl:h-36 w-full lg:w-32 xl:w-40 2xl:w-48 flex-shrink-0 flex items-center justify-center bg-gray-50">
                      {project.filename ? (
                        <img 
                          src={`http://localhost:5001/project/download?filepath=${project.filename}`}
                          alt={project.projectName}
                          className="w-full h-full object-cover"
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
                        <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-12 lg:w-12 xl:h-16 xl:w-16 rounded-lg flex items-center justify-center bg-gray-100">
                          <img 
                            src="/svg/software.svg" 
                            alt="Software Project"
                            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-5 lg:h-5 xl:w-6 xl:h-6"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Content - Right Side */}
                    <div className="flex-1 px-3 sm:px-4 lg:px-4 xl:px-5 flex flex-col justify-between min-w-0">
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="pt-2 font-semibold text-gray-900 text-sm sm:text-base lg:text-base xl:text-lg leading-tight truncate">{project.projectName}</h3>
                        <div className="space-y-1 text-xs sm:text-xs truncate">
                          <p className="text-gray-600">Applied: {new Date(project.applyDate).toLocaleDateString()}</p>
                          {project.purchaseDate && (
                            <p className="text-gray-600">Purchased: {new Date(project.purchaseDate).toLocaleDateString()}</p>
                          )}
                          <p className="text-gray-500">
                            Subscription: {project.periodicity ? 
                              `${project.periodicity} month${project.periodicity > 1 ? 's' : ''}` : 
                              'Not specified'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-1 mb-1 flex items-center justify-between">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          project.isApply === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.isApply === 1 ? 'Implemented' : 'Pending'}
                        </span>
                        
                        {/* Configuration Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onConfigureProject?.(project.projectId, project.userId)
                          }}
                          className="p-1.5 sm:p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-colors"
                          title="Configure Subscription Settings"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Show unique projects across all users
              getUniqueAppliedProjects().map((project) => {
                // Get the first project instance to access the filename
                const firstProjectInstance = appliedProjects.find(p => p.projectId === project.projectId);
                return (
                  <div key={project.projectId} className="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex flex-col lg:flex-row">
                      {/* Project Image Display */}
                      <div className="h-64 sm:h-56 lg:h-32 xl:h-36 w-full lg:w-32 xl:w-40 2xl:w-48 flex-shrink-0 flex items-center justify-center bg-gray-50">
                        {firstProjectInstance?.filename ? (
                          <img 
                            src={`http://localhost:5001/project/download?filepath=${firstProjectInstance.filename}`}
                            alt={project.projectName}
                            className="w-full h-full object-cover"
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
                        <div className={`fallback-svg bg-gray-50 h-full w-full flex items-center justify-center ${firstProjectInstance?.filename ? 'hidden' : 'flex'}`}>
                          <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-12 lg:w-12 xl:h-16 xl:w-16 rounded-lg flex items-center justify-center bg-gray-100">
                            <img 
                              src="/svg/software.svg" 
                              alt="Software Project"
                              className="w-6 h-6 sm:w-8 sm:h-8 lg:w-5 lg:h-5 xl:w-6 xl:h-6"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Text Content - Right Side */}
                      <div className="flex-1 px-3 sm:px-4 lg:px-4 xl:px-5 flex flex-col justify-between min-w-0">
                        <div className="space-y-1 sm:space-y-1">
                          <h3 className="pt-2 font-semibold text-gray-900 text-sm sm:text-base lg:text-base xl:text-lg leading-tight truncate">{project.projectName}</h3>
                          <div className="space-y-1 text-xs sm:text-xs truncate">
                            <p className="text-gray-600">Total Subscribers: {project.totalSubscribers}</p>
                            <div className="flex flex-wrap items-center gap-0 text-gray-500 ">
                              <span>Active: {project.subscribers.filter((s: ProjectSubscriber) => s.isApply === 1).length}</span>
                              <span className="px-2">|</span>
                              <span>Pending: {project.subscribers.filter((s: ProjectSubscriber) => s.isApply === 0).length}</span>
                            </div>
                            <p className="text-gray-500">
                              Avg. Subscription: {(() => {
                                const validSubscribers = project.subscribers.filter(s => s.periodicity && s.periodicity > 0)
                                if (validSubscribers.length === 0) {
                                  return 'Not specified'
                                }
                                
                                const totalMonths = validSubscribers.reduce((acc, subscriber) => {
                                  return acc + (subscriber.periodicity || 0)
                                }, 0)
                                const avgMonths = Math.round(totalMonths / validSubscribers.length)
                                
                                return `${avgMonths} month${avgMonths > 1 ? 's' : ''}`
                              })()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-1 mb-1 sm:mt-1 sm:mb-1 flex items-center justify-between">
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                            {project.totalSubscribers} User{project.totalSubscribers !== 1 ? 's' : ''}
                          </span>
                          
                          {/* Configuration Icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onConfigureProject?.(project.projectId)
                            }}
                            className="p-1.5 sm:p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-colors"
                            title="Configure Project Settings"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  )
}
