'use client'

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
  onSave: (user: User) => void
  onChange: (user: User) => void
  onCancel: () => void
}

export default function UserEditForm({ editingUser, onSave, onChange, onCancel }: UserEditFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(editingUser)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editingUser.email}
              onChange={(e) => onChange({...editingUser, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={editingUser.firstname}
                onChange={(e) => onChange({...editingUser, firstname: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={editingUser.lastname}
                onChange={(e) => onChange({...editingUser, lastname: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={editingUser.company}
              onChange={(e) => onChange({...editingUser, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
            <input
              type="text"
              value={editingUser.hotelname}
              onChange={(e) => onChange({...editingUser, hotelname: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
            <CustomSelect
              options={[
                { value: 0, label: 'Not Verified' },
                { value: 1, label: 'Verified' }
              ]}
              value={editingUser.isVerify}
              onChange={(value) => onChange({...editingUser, isVerify: Number(value)})}
              placeholder="Select Verification Status"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-4 ">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm  text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm  text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
