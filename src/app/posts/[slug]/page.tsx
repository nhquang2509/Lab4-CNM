import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CommentForm } from '@/components/posts/comment-form'
import { RealtimeComments } from '@/components/posts/realtime-comments'
import { LikeButton } from '@/components/posts/like-button'
import ReactMarkdown from 'react-markdown'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  return {
    title: post?.title || 'Bài viết',
    description: post?.excerpt || '',
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    notFound()
  }

  // Lấy comments kèm thông tin author
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('post_id', post.id)
    .order('created_at', { ascending: true })

  // Kiểm tra user đã đăng nhập chưa
  const { data: { user } } = await supabase.auth.getUser()

  // Lấy tổng số likes và trạng thái like của user hiện tại
  const [{ count: likeCount }, { data: userLike }] = await Promise.all([
    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id),
    user
      ? supabase
          .from('likes')
          .select('post_id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-gray-500">
            <span>Bởi {(post as any).profiles?.display_name || 'Ẩn danh'}</span>
            <span>•</span>
            <time>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </time>
          </div>
        </header>

        <div className="prose prose-lg max-w-none mb-8">
          <ReactMarkdown
            components={{
              img: ({ src, alt }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-lg max-w-full h-auto my-4"
                />
              ),
            }}
          >
            {post.content || ''}
          </ReactMarkdown>
        </div>

        {/* Like Button */}
        <div className="flex items-center gap-4 mb-4">
          <LikeButton
            postId={post.id}
            initialLikeCount={likeCount ?? 0}
            initialLiked={!!userLike}
            isLoggedIn={!!user}
          />
        </div>
      </article>

      {/* Comments Section */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Bình luận ({comments?.length || 0})
        </h2>

        {user ? (
          <div className="mb-8">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <p className="text-gray-500 mb-8">
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Đăng nhập
            </a>
            {' '}để bình luận.
          </p>
        )}

        <RealtimeComments postId={post.id} initialComments={comments || []} />
      </section>
    </main>
  )
}
