import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { SearchBox } from './search-box'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Simple Blog
          </Link>

          {/* Search Box */}
          <Suspense fallback={<div className="w-44 h-8 bg-gray-100 rounded-md animate-pulse" />}>
            <SearchBox />
          </Suspense>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Trang chủ
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Profile
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Đăng xuất
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
