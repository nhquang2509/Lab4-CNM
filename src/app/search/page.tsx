import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Tìm kiếm: ${q}` : 'Tìm kiếm',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const supabase = await createClient()

  let results: Array<{
    id: string
    title: string
    slug: string
    excerpt: string | null
    highlighted_content: string
  }> = []

  let searchError: string | null = null

  if (query) {
    const { data, error } = await supabase
      .rpc('search_published_posts', { search_term: query })

    if (error) {
      console.error('Search error:', error)
      searchError = 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.'
    } else {
      results = data || []
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Tìm kiếm</h1>

      {query && (
        <p className="text-gray-500 mb-8">
          {searchError
            ? searchError
            : results.length > 0
            ? `Tìm thấy ${results.length} kết quả cho "${query}"`
            : `Không tìm thấy kết quả nào cho "${query}"`}
        </p>
      )}

      {!query && (
        <p className="text-gray-500 mb-8">Nhập từ khóa vào ô tìm kiếm trên thanh điều hướng.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((post) => (
            <article
              key={post.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-xl font-semibold hover:text-blue-600 transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>

              {/* Highlighted excerpt from content */}
              <div
                className="text-gray-600 text-sm search-highlight"
                dangerouslySetInnerHTML={{ __html: post.highlighted_content }}
              />

              {post.excerpt && (
                <p className="text-gray-500 text-sm mt-2 italic">{post.excerpt}</p>
              )}

              <Link
                href={`/posts/${post.slug}`}
                className="inline-block mt-3 text-blue-600 hover:text-blue-500 text-sm"
              >
                Đọc tiếp →
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
