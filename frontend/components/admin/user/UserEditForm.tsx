'use client'

import { useState } from 'react'
import CustomSelect from '../../CustomSelect'

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

interface UserEditFormProps {
  editingUser: User
  onSave: (user: User, password?: string) => void
  onChange: (user: User) => void
  onCancel: () => void
}

export default function UserEditForm({ editingUser, onSave, onChange, onCancel }: UserEditFormProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(editingUser, password || undefined)
  }

  return (
    <div className="flex flex-col h-full max-h-full min-h-0">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit User</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 p-1"
          type="button"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 pb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editingUser.email}
              onChange={(e) => onChange({...editingUser, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={editingUser.firstname}
                onChange={(e) => onChange({...editingUser, firstname: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={editingUser.lastname}
                onChange={(e) => onChange({...editingUser, lastname: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={editingUser.company}
              onChange={(e) => onChange({...editingUser, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
            <input
              type="text"
              value={editingUser.hotelname}
              onChange={(e) => onChange({...editingUser, hotelname: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Role</label>
              <CustomSelect
                options={[
                  { value: 0, label: 'Admin' },
                  { value: 1, label: 'User' },
                  { value: 2, label: 'Support' }
                ]}
                value={editingUser.role}
                onChange={(value) => onChange({...editingUser, role: Number(value)})}
                placeholder="Select Role"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Verification Status</label>
              <CustomSelect
                options={[
                  { value: 0, label: 'Not Verified' },
                  { value: 1, label: 'Verified' }
                ]}
                value={editingUser.isVerify}
                onChange={(value) => {
                  const numValue = Number(value)
                  // When verification status changes, also update the status field
                  // Verified (1) sets status to 1, Not Verified (0) sets status to 0
                  onChange({
                    ...editingUser, 
                    isVerify: numValue,
                    status: numValue
                  })
                }}
                placeholder="Select Verification Status"
              />
            </div>
          </div>
          
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Change Password <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-sm"
              placeholder="Leave empty to keep current password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only fill this field if you want to change the user's password
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white -mx-1 px-1 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
