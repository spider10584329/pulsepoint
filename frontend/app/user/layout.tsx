'use client'

import DashboardLayout from '@/components/DashboardLayout'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
