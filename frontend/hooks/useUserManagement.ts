'use client'

import { useState, useEffect } from 'react'
import { User, AppliedProject } from '@/types/admin/admin'
import { useToast } from '@/lib/context/ToastContext'

export const useUserManagement = () => {
  const { showToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [appliedProjects, setAppliedProjects] = useState<AppliedProject[]>([])
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
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

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Fetch users and applied projects data
        fetchUsers(token)
        fetchAppliedProjects(token)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/user/allusers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        showToast('error', 'Loading Error', 'Failed to load users. Please refresh the page.')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('error', 'Connection Error', 'Unable to connect to server. Please check your connection.')
    }
  }

  const fetchAppliedProjects = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/apply/project/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()        
        setAppliedProjects(data)
      } else {
        showToast('error', 'Loading Error', 'Failed to load applied projects. Please refresh the page.')
      }
    } catch (error) {
      console.error('Error fetching applied projects:', error)
      showToast('error', 'Connection Error', 'Unable to connect to server. Please check your connection.')
    }
  }

  const handleUserClick = (userId: number) => {
    setSelectedUserId(selectedUserId === userId ? null : userId)   
  }

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'delete' | 'edit') => {
    setActionLoading(userId)
    try {      
      if (action === 'edit') {
        // Find the user and show edit form in right panel
        const userToEdit = users.find(u => u.id === userId)
        if (userToEdit) {
          setEditingUser(userToEdit)
          setSelectedUserId(null) // Clear any selected user to show edit form
        }
        setActionLoading(null)
        return
      }

      if (action === 'delete') {
        await handleDeleteUser(userId)
        setActionLoading(null)
        return
      }
      
      // Handle other actions (activate, deactivate) if needed in the future
      const token = localStorage.getItem('token')
      if (token) {
        await fetchUsers(token)
        showToast('success', 'Action Completed', `User ${action} completed successfully.`)
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      showToast('error', 'Action Failed', `Failed to ${action} user. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      // Find the user to get their email for display
      const userToDelete = users.find(u => u.id === userId)
      if (!userToDelete) {
        showToast('error', 'User Not Found', 'The selected user could not be found.')
        return
      }

      // Check if user has any applied projects
      const userProjects = appliedProjects.filter(project => project.userId === userId)
      if (userProjects.length > 0) {
        showToast('info', 'Cannot Delete User', 
          `User ${userToDelete.email} has ${userProjects.length} applied project(s) and cannot be deleted. Please remove their project applications first.`)
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'Authentication token not found. Please login again.')
        return
      }

      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        title: 'Delete User',
        message: `Are you sure you want to delete user "${userToDelete.email}"? This action cannot be undone.`,
        onConfirm: () => performDeleteUser(userId, userToDelete, token)
      })
      
    } catch (error) {
      console.error('Error deleting user:', error)
      showToast('error', 'Delete Error', 'An unexpected error occurred while deleting the user. Please try again.')
    }
  }

  const performDeleteUser = async (userId: number, userToDelete: User, token: string) => {
    try {
      // Close the confirmation dialog
      setConfirmDialog(prev => ({ ...prev, isOpen: false }))

      // Make API call to delete user
      const response = await fetch(`http://localhost:5001/api/user/delete?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.status === 1) {
          // Remove user from local state
          setUsers(prev => prev.filter(u => u.id !== userId))
          // Also clear any selection if this user was selected
          if (selectedUserId === userId) {
            setSelectedUserId(null)
          }
          showToast('success', 'User Deleted', `User ${userToDelete.email} has been successfully deleted.`)
        } else {
          showToast('error', 'Delete Failed', result.message || 'Failed to delete user.')
        }
      } else {
        const errorText = await response.text()
        showToast('error', 'Delete Failed', `Server error: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showToast('error', 'Delete Error', 'An unexpected error occurred while deleting the user. Please try again.')
    }
  }

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
  }

  const handleSaveUser = async (updatedUser: User) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showToast('error', 'Authentication Error', 'Authentication token not found. Please login again.')
        return
      }
      
      // Create JSON data for the API request
      const requestData = {
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        company: updatedUser.company,
        hotelname: updatedUser.hotelname,
        role: updatedUser.role.toString(),
        status: updatedUser.status.toString(),
        isVerify: updatedUser.isVerify.toString()
      }
      
      const response = await fetch(`http://localhost:5001/api/user/update/details?id=${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.status === 1) {
          // Update user in local state
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))
          setEditingUser(null)
          // Refresh the user list to get updated data from server
          const token = localStorage.getItem('token')
          if (token) {
            await fetchUsers(token)
          }
          showToast('success', 'User Updated', 'User information has been updated successfully!')
        } else {
          showToast('error', 'Update Failed', result.message || 'Failed to update user information.')
        }
      } else {
        const errorText = await response.text()
        showToast('error', 'Update Failed', `Server error: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showToast('error', 'Update Error', 'An unexpected error occurred while updating the user. Please try again.')
    }
  }

  const handleEditingUserChange = (updatedUser: User) => {
    setEditingUser(updatedUser)
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
  }

  const handleClearSelection = () => {
    setSelectedUserId(null)
  }

  const refreshAppliedProjects = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await fetchAppliedProjects(token)
    }
  }

  return {
    user,
    isLoading,
    users,
    appliedProjects,
    actionLoading,
    selectedUserId,
    editingUser,
    confirmDialog,
    handleUserClick,
    handleUserAction,
    handleSaveUser,
    handleEditingUserChange,
    handleCancelEdit,
    handleClearSelection,
    handleCloseConfirmDialog,
    refreshAppliedProjects
  }
}
