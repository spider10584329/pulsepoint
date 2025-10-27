import './globals.css'
import { ToastProvider } from '../lib/context/ToastContext'

export const metadata = {
  title: 'PulsePoint - Authentication System',
  description: 'User authentication system for PulsePoint',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
