/**
 * Admin Layout
 * Protects all admin routes - only users with admin emails can access
 */

import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is admin
  const adminStatus = await isAdmin()

  // Redirect non-admins to home
  if (!adminStatus) {
    redirect('/')
  }

  return <>{children}</>
}
