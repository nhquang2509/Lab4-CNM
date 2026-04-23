import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile của tôi',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // Nếu chưa có profile, tạo mới
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      })
      .select()
      .single()

    if (!newProfile) {
      return (
        <main className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-red-500">Không thể tải thông tin profile.</p>
        </main>
      )
    }

    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile của tôi</h1>
          <p className="text-gray-500 mt-1">Email: {user.email}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <ProfileForm profile={newProfile} />
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile của tôi</h1>
        <p className="text-gray-500 mt-1">Email: {user.email}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <ProfileForm profile={profile} />
      </div>
    </main>
  )
}
