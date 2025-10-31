'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import CustomSelect from '@/components/CustomSelect'

interface User {
  id: number
  firstname: string
  lastname: string
  email: string
  company: string
  hotelname: string
  role?: number
  isVerify: number
  status: number
  created_at?: string
}

interface AppliedProject {
  id: number
  userId: number
  projectId: number
  username: string
  projectName: string
  isApply: number
  applyDate: string
  purchaseDate?: string
  periodicity?: number
  filename: string
}

interface Project {
  id: number
  name: string
  description?: string
}

interface ProjectStats {
  projectId: number
  projectName: string
  totalSubscribers: number
  activeSubscriptions: number
  expiredSubscriptions: number
  trialUsers: number
  pendingApplications: number
  totalRevenue: number
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [appliedProjects, setAppliedProjects] = useState<AppliedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  
  // Pagination state for each table type per project
  const [paginationState, setPaginationState] = useState<{[key: string]: {
    activeSubscribers: number
    trialUsers: number
    pendingUsers: number
    expiredUsers: number
  }}>({})
  
  const ITEMS_PER_PAGE = 5
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      
      // Check if user is admin (role 0)
      if (parsedUser.role !== 0) {
        router.push('/dashboard')
        return
      }
      
      setUser(parsedUser)
      fetchDashboardData(token)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
      return
    }
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      // Fetch all required data in parallel
      const [usersRes, projectsRes, appliedProjectsRes] = await Promise.all([
        fetch('http://localhost:5001/api/user/allusers', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:5001/api/project/read', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:5001/api/apply/project/all', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData)
      }

      if (appliedProjectsRes.ok) {
        const appliedData = await appliedProjectsRes.json()
        setAppliedProjects(appliedData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOverallStats = () => {
    let activePaidSubscribers = 0
    let trialUsers = 0
    let expiredSubscriptions = 0
    let pendingApprovals = 0

    appliedProjects.forEach(ap => {
      // Check if purchase date exists and is valid (not null, not empty, not "None")
      const hasPurchaseDate = ap.purchaseDate && 
                             ap.purchaseDate.trim() !== "" && 
                             ap.purchaseDate !== "None" &&
                             ap.purchaseDate !== "null"

      if (ap.isApply === 1) {
        // Active subscription
        if (hasPurchaseDate) {
          // Active with payment
          activePaidSubscribers++
        } else {
          // Active trial (no purchase date)
          trialUsers++
        }
      } else if (ap.isApply === 0) {
        // Pending approval
        pendingApprovals++
      } else {
        // Expired or suspended (isApply === 2)
        expiredSubscriptions++
      }
    })

    return {
      totalUsers: users.length,
      totalProjects: projects.length,
      activePaidSubscribers,
      trialUsers,
      pendingApprovals,
      expiredSubscriptions
    }
  }

  const getProjectDetails = () => {
    const projectMap = new Map<number, {
      projectId: number
      projectName: string
      activeSubscribers: AppliedProject[]
      trialUsers: AppliedProject[]
      pendingUsers: AppliedProject[]
      expiredUsers: AppliedProject[]
    }>()

    // Initialize for all projects
    projects.forEach(project => {
      projectMap.set(project.id, {
        projectId: project.id,
        projectName: project.name,
        activeSubscribers: [],
        trialUsers: [],
        pendingUsers: [],
        expiredUsers: []
      })
    })

    // Categorize applied projects
    appliedProjects.forEach(ap => {
      const projectData = projectMap.get(ap.projectId)
      if (!projectData) return

      // Check if purchase date exists and is valid
      const hasPurchaseDate = ap.purchaseDate && 
                             ap.purchaseDate.trim() !== "" && 
                             ap.purchaseDate !== "None" &&
                             ap.purchaseDate !== "null"

      if (ap.isApply === 1) {
        if (hasPurchaseDate) {
          projectData.activeSubscribers.push(ap)
        } else {
          projectData.trialUsers.push(ap)
        }
      } else if (ap.isApply === 0) {
        projectData.pendingUsers.push(ap)
      } else {
        projectData.expiredUsers.push(ap)
      }
    })

    return Array.from(projectMap.values())
  }

  const getUserEmail = (userId: number) => {
    const user = users.find(u => u.id === userId)
    return user?.email || 'Unknown User'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const calculateExpirationDate = (purchaseDate?: string, periodicity?: number) => {
    if (!purchaseDate || !periodicity) return 'N/A'
    
    try {
      const purchase = new Date(purchaseDate)
      // Add months to the purchase date
      const expiration = new Date(purchase.setMonth(purchase.getMonth() + periodicity))
      
      return expiration.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const overallStats = getOverallStats()
  const projectDetails = getProjectDetails()

  // Filter projects based on selections
  const getFilteredProjectDetails = () => {
    let filtered = projectDetails

    // Filter by project
    if (selectedProjectId !== 'all') {
      filtered = filtered.filter(p => p.projectId === parseInt(selectedProjectId))
    }

    // Filter by user
    if (selectedUserId !== 'all') {
      const userId = parseInt(selectedUserId)
      filtered = filtered.map(project => ({
        ...project,
        activeSubscribers: project.activeSubscribers.filter(sub => sub.userId === userId),
        trialUsers: project.trialUsers.filter(sub => sub.userId === userId),
        pendingUsers: project.pendingUsers.filter(sub => sub.userId === userId),
        expiredUsers: project.expiredUsers.filter(sub => sub.userId === userId)
      })).filter(project => 
        project.activeSubscribers.length > 0 || 
        project.trialUsers.length > 0 || 
        project.pendingUsers.length > 0 ||
        project.expiredUsers.length > 0
      )
    }

    return filtered
  }

  const filteredProjectDetails = getFilteredProjectDetails()

  // Helper function to get current page for a project and table type
  const getCurrentPage = (projectId: number, tableType: 'activeSubscribers' | 'trialUsers' | 'pendingUsers' | 'expiredUsers') => {
    return paginationState[projectId]?.[tableType] || 1
  }

  // Helper function to set current page
  const setCurrentPage = (projectId: number, tableType: 'activeSubscribers' | 'trialUsers' | 'pendingUsers' | 'expiredUsers', page: number) => {
    setPaginationState(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [tableType]: page
      }
    }))
  }

  // Helper function to paginate array
  const paginateArray = <T,>(array: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return array.slice(startIndex, endIndex)
  }

  // Helper function to calculate total pages
  const getTotalPages = (totalItems: number): number => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE)
  }

  // Pagination component
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void 
  }) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-1 text-gray-500">...</span>
              }
              return null
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        
        <div className="text-xs sm:text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-xs sm:text-sm text-gray-500">Welcome, {user.firstname} {user.lastname}</div>
      </div>
      <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
        {/* Statistics Cards - Responsive Grid */}
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Total Users */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-3 sm:p-4 text-white">
                <div className="text-center">
                  <div className="bg-blue-400 bg-opacity-30 rounded-full p-1.5 sm:p-2 inline-block mb-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-blue-100 uppercase tracking-wide">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{overallStats.totalUsers}</p>
                </div>
              </div>

              {/* Total Projects */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-3 sm:p-4 text-white">
                <div className="text-center">
                  <div className="bg-purple-400 bg-opacity-30 rounded-full p-1.5 sm:p-2 inline-block mb-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-purple-100 uppercase tracking-wide">Total Projects</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{overallStats.totalProjects}</p>
                </div>
              </div>

              {/* Active Paid Subscribers */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-3 sm:p-4 text-white">
                <div className="text-center">
                  <div className="bg-green-400 bg-opacity-30 rounded-full p-1.5 sm:p-2 inline-block mb-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-green-100 uppercase tracking-wide">Paid Subscribers</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{overallStats.activePaidSubscribers}</p>
                </div>
              </div>

              {/* Trial Users */}
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-md p-3 sm:p-4 text-white">
                <div className="text-center">
                  <div className="bg-cyan-400 bg-opacity-30 rounded-full p-1.5 sm:p-2 inline-block mb-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-cyan-100 uppercase tracking-wide">Trial Users</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{overallStats.trialUsers}</p>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-3 sm:p-4 text-white">
                <div className="text-center">
                  <div className="bg-yellow-400 bg-opacity-30 rounded-full p-1.5 sm:p-2 inline-block mb-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-yellow-100 uppercase tracking-wide">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{overallStats.pendingApprovals}</p>
                </div>
              </div>

              {/* Expired Subscriptions */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-3 sm:p-4 text-white">
                <div className="text-center">
                  <div className="bg-red-400 bg-opacity-30 rounded-full p-1.5 sm:p-2 inline-block mb-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-red-100 uppercase tracking-wide">Expired</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{overallStats.expiredSubscriptions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription status</h2>
            
          </div>
          
          {/* Filter Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* User Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Filter by User</label>
              <CustomSelect
                value={selectedUserId === 'all' ? '' : parseInt(selectedUserId)}
                onChange={(value) => setSelectedUserId(value ? value.toString() : 'all')}
                options={users.map(user => ({
                  value: user.id,
                  label: user.email
                }))}
                placeholder="All Users"
              />
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Filter by Project</label>
              <CustomSelect
                value={selectedProjectId === 'all' ? '' : parseInt(selectedProjectId)}
                onChange={(value) => setSelectedProjectId(value ? value.toString() : 'all')}
                options={projects.map(project => ({
                  value: project.id,
                  label: project.name
                }))}
                placeholder="All Projects"
              />
            </div>
          </div>

          {/* Project Details Section */}
          <div className="mt-6">
            <div>
              <div className="space-y-4">
                {filteredProjectDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-3">
                      <img 
                        src="/svg/software.svg" 
                        alt="Project"
                        className="w-10 h-10 sm:w-12 sm:h-12"
                      />
                    </div>
                    <p className="text-sm sm:text-base text-gray-500">No data found for the selected filters</p>
                  </div>
                ) : (
                filteredProjectDetails.map((project) => (
                <div key={project.projectId} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  {/* Project Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">                   
                      <img 
                        src="/svg/software.svg" 
                        alt="Project"
                        className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      />                   
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{project.projectName}</h2>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3">
                    {/* Active Paid Subscribers Table */}
                    {project.activeSubscribers.length > 0 && (() => {
                      const currentPage = getCurrentPage(project.projectId, 'activeSubscribers')
                      const paginatedData = paginateArray(project.activeSubscribers, currentPage)
                      const totalPages = getTotalPages(project.activeSubscribers.length)
                      
                      return (
                        <div className="mb-3 sm:mb-4">
                          <h3 className="text-xs sm:text-sm font-semibold text-green-700 px-2 sm:px-3 py-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                            <span className="truncate">Active Paid Subscribers ({project.activeSubscribers.length})</span>
                          </h3>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Applied</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Purchased</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Period</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Expires</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {paginatedData.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                        <div className="max-w-[150px] sm:max-w-none truncate">{getUserEmail(sub.userId)}</div>
                                      </td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">{formatDate(sub.applyDate)}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">{formatDate(sub.purchaseDate)}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm text-gray-900 hidden xl:table-cell">
                                        {sub.periodicity || 'N/A'} month{sub.periodicity && sub.periodicity > 1 ? 's' : ''}
                                      </td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden xl:table-cell">{calculateExpirationDate(sub.purchaseDate, sub.periodicity)}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center">
                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                          Active
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={(page) => setCurrentPage(project.projectId, 'activeSubscribers', page)}
                            />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Trial Users Table */}
                    {project.trialUsers.length > 0 && (() => {
                      const currentPage = getCurrentPage(project.projectId, 'trialUsers')
                      const paginatedData = paginateArray(project.trialUsers, currentPage)
                      const totalPages = getTotalPages(project.trialUsers.length)
                      
                      return (
                        <div className="mb-3 sm:mb-4">
                          <h3 className="text-xs sm:text-sm font-semibold text-cyan-700 px-2 sm:px-3 py-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0"></span>
                            <span className="truncate">Trial Users ({project.trialUsers.length})</span>
                          </h3>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Applied</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Purchased</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Period</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Expires</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {paginatedData.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                        <div className="max-w-[150px] sm:max-w-none truncate">{getUserEmail(sub.userId)}</div>
                                      </td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">{formatDate(sub.applyDate)}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden lg:table-cell">N/A</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm text-gray-400 hidden xl:table-cell">N/A</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden xl:table-cell">N/A</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center">
                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800">
                                          Trial
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={(page) => setCurrentPage(project.projectId, 'trialUsers', page)}
                            />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Pending Users Table */}
                    {project.pendingUsers.length > 0 && (() => {
                      const currentPage = getCurrentPage(project.projectId, 'pendingUsers')
                      const paginatedData = paginateArray(project.pendingUsers, currentPage)
                      const totalPages = getTotalPages(project.pendingUsers.length)
                      
                      return (
                        <div className="mb-3 sm:mb-4">
                          <h3 className="text-xs sm:text-sm font-semibold text-yellow-700 px-2 sm:px-3 py-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                            <span className="truncate">Pending Approvals ({project.pendingUsers.length})</span>
                          </h3>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Applied</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Purchased</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Period</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Expires</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {paginatedData.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                        <div className="max-w-[150px] sm:max-w-none truncate">{getUserEmail(sub.userId)}</div>
                                      </td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">{formatDate(sub.applyDate)}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden lg:table-cell">N/A</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm text-gray-400 hidden xl:table-cell">N/A</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden xl:table-cell">N/A</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center">
                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                          Pending
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={(page) => setCurrentPage(project.projectId, 'pendingUsers', page)}
                            />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Expired Users Table */}
                    {project.expiredUsers.length > 0 && (() => {
                      const currentPage = getCurrentPage(project.projectId, 'expiredUsers')
                      const paginatedData = paginateArray(project.expiredUsers, currentPage)
                      const totalPages = getTotalPages(project.expiredUsers.length)
                      
                      return (
                        <div className="mb-2">
                          <h3 className="text-xs sm:text-sm font-semibold text-red-700 px-2 sm:px-3 py-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                            <span className="truncate">Expired Subscriptions ({project.expiredUsers.length})</span>
                          </h3>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Applied</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Purchased</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Period</th>
                                    <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Expired On</th>
                                    <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {paginatedData.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                        <div className="max-w-[150px] sm:max-w-none truncate">{getUserEmail(sub.userId)}</div>
                                      </td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">{formatDate(sub.applyDate)}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">{formatDate(sub.purchaseDate) || 'N/A'}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm text-gray-900 hidden xl:table-cell">
                                        {sub.periodicity ? `${sub.periodicity} month${sub.periodicity > 1 ? 's' : ''}` : 'N/A'}
                                      </td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden xl:table-cell">{calculateExpirationDate(sub.purchaseDate, sub.periodicity)}</td>
                                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center">
                                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                          Expired
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={(page) => setCurrentPage(project.projectId, 'expiredUsers', page)}
                            />
                          </div>
                        </div>
                      )
                    })()}

                    {/* No subscribers message */}
                    {project.activeSubscribers.length === 0 && project.trialUsers.length === 0 && project.pendingUsers.length === 0 && project.expiredUsers.length === 0 && (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <p className="text-xs sm:text-sm">No subscribers for this project yet</p>
                      </div>
                    )}
                  </div>
                </div>
                ))
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
