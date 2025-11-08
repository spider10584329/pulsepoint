'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      
      // Validate user object has required properties
      if (!parsedUser || !parsedUser.id || !parsedUser.email || parsedUser.isVerify === undefined) {
        handleLogout()
        return
      }
      
      // Check if user is verified
      if (parsedUser.isVerify !== 1) {
        // User is not verified, redirect to verification
        localStorage.setItem('pendingUserId', parsedUser.id.toString())
        localStorage.setItem('pendingUserEmail', parsedUser.email)
        router.push(`/verify?id=${parsedUser.id}&email=${encodeURIComponent(parsedUser.email)}`)
        return
      }
      
      setUser(parsedUser)
    } catch (error) {
      // If user data is corrupted, redirect to home
      console.error('DashboardLayout user data error:', error)
      handleLogout()
    }
  }, [router])

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse sidebar on screens smaller than 768px (md breakpoint)
      // This provides a good balance between usability and screen real estate
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      } else if (window.innerWidth >= 1280) {
        // Auto-expand on larger screens (xl breakpoint and above)
        setSidebarCollapsed(false)
      }
      // Between 768px and 1280px, maintain user's preference
    }

    // Set initial state
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  // Role-based navigation
  const getNavigationForRole = (role: number) => {
    switch (role) {
      case 0: // Administrator
        return [
          { name: 'Dashboard', href: '/admin', icon: '/svg/dashboard.svg' },
          { name: 'Users', href: '/admin/user', icon: '/svg/users.svg' },
          { name: 'Software', href: '/admin/software', icon: '/svg/software.svg' },
          { name: 'API Key', href: '/admin/apikey', icon: '/svg/key.svg' },
        ]
      case 1: // Regular User
        return [
          { name: 'Dashboard', href: '/user', icon: '/svg/dashboard.svg' },
          { name: 'Software', href: '/user/software', icon: '/svg/software.svg' },
          { name: 'FAQ', href: '/user/faq', icon: '/svg/fag.svg' },
          { name: 'Support', href: '/user/support', icon: '/svg/support.svg' },
        ]
      case 2: // Support Team Member
        return [
          { name: 'Dashboard', href: '/supportTeam', icon: '/svg/dashboard.svg' },
          { name: 'Tickets', href: '/supportTeam/tickets', icon: '/svg/support.svg' },
          { name: 'FAQ', href: '/supportTeam/faq', icon: '/svg/fag.svg' },
        ]
      default:
        return []
    }
  }

  const navigation = user ? getNavigationForRole(user.role) : []

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Static sidebar - always visible */}
      <div className="flex flex-shrink-0">
        <div className={`flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <SidebarContent 
            navigation={navigation} 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-[75px] bg-white border-b border-gray-300">
          {/* Sidebar toggle button - always visible */}
          <button
            className="flex items-center justify-center px-4 text-gray-500 hover:text-gray-700 "
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                   
                  </div>                 
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-2">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-1">
                    {user?.firstname} {user?.lastname}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 "
                  >
                    <img 
                      src="/svg/logout.svg" 
                      alt="Logout" 
                      className="h-6 w-6 opacity-80 hover:opacity-100"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ 
  navigation, 
  collapsed = false, 
  onToggleCollapse 
}: { 
  navigation: any[]; 
  collapsed?: boolean; 
  onToggleCollapse?: () => void;
}) {
  const router = useRouter()
  const currentPath = usePathname()
  
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      {/* Header with logo and toggle button */}
      <div className={`flex items-center h-[75px] flex-shrink-0 bg-white border-b border-gray-200 ${
        collapsed ? 'px-2 justify-center' : 'px-4 justify-between'
      }`}>
        {collapsed ? (
          <div className="flex items-center justify-center">
            <img src="/icon-light.png" alt="Icon" className="w-8 h-8" />
          </div>
        ) : (
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="w-auto h-12" />
          </div>
        )}
      </div>
      <div className="h-0 flex-1 flex flex-col overflow-y-auto">
        <nav className={`flex-1 py-4 bg-white space-y-3 ${collapsed ? 'px-2' : 'px-5'}`}>
          {navigation.map((item) => {
            // Precise active detection - exact match or starts with the href followed by /
            let isActive = false
            if (currentPath === item.href) {
              isActive = true
            } else if (item.href !== '/' && currentPath.startsWith(item.href + '/')) {
              // Make sure no other longer route also matches
              const longerMatches = navigation.filter(nav => 
                nav.href !== item.href && 
                nav.href.length > item.href.length && 
                currentPath.startsWith(nav.href)
              )
              isActive = longerMatches.length === 0
            }
            return (
              <div key={item.name} className="relative group">
                <a
                  href={item.href}
                  onClick={(e) => handleNavigation(item.href, e)}
                  className={`flex items-center text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                    collapsed 
                      ? 'px-3 py-3 justify-center' 
                      : 'px-5 py-2'
                  } ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 border border-gray-300'
                      : 'text-gray-800 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`flex-shrink-0 h-5 w-5 transition-opacity duration-200 ${
                      collapsed ? '' : 'mr-3'
                    } ${
                      isActive
                        ? 'opacity-100'
                        : 'opacity-90 group-hover:opacity-100'
                    }`}
                  />
                  {!collapsed && (
                    <span className="transition-opacity duration-200">{item.name}</span>
                  )}
                </a>
                {collapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
