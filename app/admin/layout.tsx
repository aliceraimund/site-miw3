import { createServerClient } from '@/lib/supabase/server'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Login page is also inside this layout, so don't redirect here.
  // proxy.ts handles redirecting unauthenticated requests to /admin/login.
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav userEmail={user.email ?? ''} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
