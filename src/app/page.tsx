import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const POSTS_PER_PAGE = 5

interface HomePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10))
  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const supabase = await createClient()

  const { data: posts, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching posts:', error)
  }

  const totalPages = Math.ceil((count ?? 0) / POSTS_PER_PAGE)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bài viết mới nhất</h1>

      {posts && posts.length > 0 ? (
        <>
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white p-6 rounded-lg shadow border border-gray-200"
              >
                <Link href={`/posts/${post.slug}`}>
                  <h2 className="text-2xl font-semibold hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                </Link>

                {post.excerpt && (
                  <p className="text-gray-600 mt-2">{post.excerpt}</p>
                )}

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span>
                    Bởi {(post as any).profiles?.display_name || 'Ẩn danh'}
                  </span>
                  <span>•</span>
                  <span>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('vi-VN')
                      : 'Chưa xuất bản'}
                  </span>
                </div>

                <Link
                  href={`/posts/${post.slug}`}
                  className="inline-block mt-4 text-blue-600 hover:text-blue-500"
                >
                  Đọc tiếp →
                </Link>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Phân trang">
              {/* Nút Trước */}
              {currentPage > 1 ? (
                <Link
                  href={`/?page=${currentPage - 1}`}
                  className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Trước
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-300 cursor-not-allowed">
                  ← Trước
                </span>
              )}

              {/* Số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/?page=${page}`}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Link>
              ))}

              {/* Nút Sau */}
              {currentPage < totalPages ? (
                <Link
                  href={`/?page=${currentPage + 1}`}
                  className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sau →
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-300 cursor-not-allowed">
                  Sau →
                </span>
              )}
            </nav>
          )}

          <p className="text-center text-sm text-gray-400 mt-4">
            Trang {currentPage} / {totalPages} • {count} bài viết
          </p>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chưa có bài viết nào.</p>
        </div>
      )}
    </main>
  )
}
