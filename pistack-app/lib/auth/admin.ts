/**
 * Admin authentication and authorization utilities
 * Only users with admin emails can access admin routes and modify templates/card definitions
 */

import { auth, currentUser } from '@clerk/nextjs/server'
import { getServiceRoleClient } from '@/lib/supabase/admin'

/**
 * List of admin emails
 * Can be moved to environment variable for production
 */
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

/**
 * Check if current user is an admin
 * Verifies both Clerk authentication and email whitelist
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    // Get user email from Clerk
    const user = await currentUser()
    if (!user?.emailAddresses?.[0]?.emailAddress) return false

    const email = user.emailAddresses[0].emailAddress

    // Check if email is in admin list
    return ADMIN_EMAILS.includes(email)
  } catch (error) {
    console.error('[Admin] Error checking admin status:', error)
    return false
  }
}

/**
 * Check if current user is an admin (alternative method via Supabase)
 * Uses the database function is_admin() for RLS policies
 */
export async function isAdminViaDB(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const supabase = getServiceRoleClient()

    // Execute the is_admin() function
    const { data, error } = await supabase.rpc('is_admin')

    if (error) {
      console.error('[Admin] Error checking admin via DB:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('[Admin] Error checking admin status via DB:', error)
    return false
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this in API routes to protect admin-only endpoints
 *
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdmin(): Promise<void> {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    throw new Error('Unauthorized: Admin access required')
  }
}

/**
 * Get current admin user details
 * Returns null if user is not an admin
 */
export async function getAdminUser() {
  const adminStatus = await isAdmin()
  if (!adminStatus) return null

  const user = await currentUser()
  if (!user) return null

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.emailAddresses[0]?.emailAddress,
    imageUrl: user.imageUrl,
  }
}

/**
 * Admin route guard for app directory
 * Use in layout.tsx or page.tsx for admin routes
 *
 * Example:
 * ```tsx
 * import { AdminGuard } from '@/lib/auth/admin'
 *
 * export default async function AdminLayout({ children }) {
 *   await AdminGuard()
 *   return <>{children}</>
 * }
 * ```
 */
export async function AdminGuard(): Promise<void> {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    // In Next.js 13+ app directory, we can't use redirect() in RSC
    // The layout will need to handle the redirect
    throw new Error('UNAUTHORIZED_ADMIN')
  }
}
