'use client'

import AuthGuard from '@/components/AuthGuard'
import UserList from '@/components/admin/user/UserList'
import UserEditForm from '@/components/admin/user/UserEditForm'
import AppliedProjectsList from '@/components/admin/user/AppliedProjectsList'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useUserManagement } from '@/hooks/useUserManagement'

export default function AdminUserPage() {
  const {
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
    handleCloseConfirmDialog
  } = useUserManagement()

  const handleConfigureProject = (projectId: number, userId?: number) => {
    // Handle project configuration
    console.log('Configure project:', projectId, 'for user:', userId)
    // TODO: Add implementation for project configuration modal/dialog
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
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-4 lg:p-4 max-w-7xl mx-auto">
        <div className="mb-4 lg:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            USER Management
          </h1>
        </div>
        
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 max-h-[40vh] overflow-hidden">
              <UserList
                users={users}
                appliedProjects={appliedProjects}
                selectedUserId={selectedUserId}
                actionLoading={actionLoading}
                isLoading={isLoading}
                onUserClick={handleUserClick}
                onUserAction={handleUserAction}
              />
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 min-h-[50vh] max-h-[55vh] flex flex-col">
              {editingUser ? (
                <UserEditForm
                  editingUser={editingUser}
                  onSave={handleSaveUser}
                  onChange={handleEditingUserChange}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <AppliedProjectsList
                  appliedProjects={appliedProjects}
                  selectedUserId={selectedUserId}
                  users={users}
                  onClearSelection={handleClearSelection}
                  onConfigureProject={handleConfigureProject}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-4 xl:gap-6">
          <div className="bg-white rounded-lg shadow p-4 xl:p-6 h-[calc(100vh-220px)] overflow-hidden flex flex-col">
            <UserList
              users={users}
              appliedProjects={appliedProjects}
              selectedUserId={selectedUserId}
              actionLoading={actionLoading}
              isLoading={isLoading}
              onUserClick={handleUserClick}
              onUserAction={handleUserAction}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4 xl:p-6 h-[calc(100vh-220px)] overflow-hidden flex flex-col">
            {editingUser ? (
              <UserEditForm
                editingUser={editingUser}
                onSave={handleSaveUser}
                onChange={handleEditingUserChange}
                onCancel={handleCancelEdit}
              />
            ) : (
              <AppliedProjectsList
                appliedProjects={appliedProjects}
                selectedUserId={selectedUserId}
                users={users}
                onClearSelection={handleClearSelection}
                onConfigureProject={handleConfigureProject}
              />
            )}
          </div>
        </div>
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
    </AuthGuard>
  )
}