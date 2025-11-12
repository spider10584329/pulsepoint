'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import { getBackendUrl } from '@/lib/api'

interface UserData {
  id: number
  company: string
  hotelname: string
  firstname: string
  lastname: string
  email: string
  phonenumber: string
  address: string
  contact: string
  role: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    hotelname: '',
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    address: '',
    contact: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const router = useRouter()
  const { showToast } = useToast()
  const backendUrl = getBackendUrl()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setFormData({
          company: parsedUser.company || '',
          hotelname: parsedUser.hotelname || '',
          firstname: parsedUser.firstname || '',
          lastname: parsedUser.lastname || '',
          email: parsedUser.email || '',
          phonenumber: parsedUser.phonenumber || '',
          address: parsedUser.address || '',
          contact: parsedUser.contact || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } catch (error) {
        router.push('/')
      }
    }
    setIsLoading(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password fields if user is trying to change password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        showToast('error', 'Error', 'Please enter your current password', 3000)
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        showToast('error', 'Error', 'New passwords do not match', 3000)
        return
      }
      if (formData.newPassword.length < 6) {
        showToast('error', 'Error', 'New password must be at least 6 characters', 3000)
        return
      }
    }

    setIsSaving(true)

    try {
      const token = localStorage.getItem('token')
      const updateData: any = {
        company: formData.company,
        hotelname: formData.hotelname,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phonenumber: formData.phonenumber,
        address: formData.address,
        contact: formData.contact
      }

      // Only include password if user wants to change it
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.password = formData.newPassword
      }

      const response = await fetch(`${backendUrl}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        // Update localStorage with new user data
        const updatedUser: UserData = {
          ...user!,
          company: formData.company,
          hotelname: formData.hotelname,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phonenumber: formData.phonenumber,
          address: formData.address,
          contact: formData.contact
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))

        showToast('success', 'Success', 'Profile updated successfully', 3000)
      } else {
        showToast('error', 'Error', data.message || 'Failed to update profile', 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('error', 'Error', 'An error occurred while updating profile', 3000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireVerification={true} allowedRoles={[0]}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your personal information and password</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    placeholder="Company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="hotelname" className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="hotelname"
                    name="hotelname"
                    value={formData.hotelname}
                    onChange={handleInputChange}
                    required
                    placeholder="Hotel name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                    placeholder="First name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                    placeholder="Last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phonenumber"
                    name="phonenumber"
                    value={formData.phonenumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Full address"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Information <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                    placeholder="Additional contact information"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <p className="text-sm text-gray-500 mb-4">Leave password fields empty to keep your current password</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm  text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none "
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm  text-white bg-gray-700 rounded-md hover:bg-gray-900 focus:outline-none  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
