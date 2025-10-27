'use client'

import DashboardLayout from '@/components/DashboardLayout'

export default function SupportTeamLayout({
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
