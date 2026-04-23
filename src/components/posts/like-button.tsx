'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
  postId: string
  initialLikeCount: number
  initialLiked: boolean
  isLoggedIn: boolean
}

export function LikeButton({ postId, initialLikeCount, initialLiked, isLoggedIn }: LikeButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      if (liked) {
        // Unlike
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) throw error

        setLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        // Like
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id })

        if (error) throw error

        setLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (err) {
      console.error('Like error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      title={isLoggedIn ? (liked ? 'Bỏ thích' : 'Thích bài viết') : 'Đăng nhập để thích'}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        liked
          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="text-lg leading-none">{liked ? '❤️' : '🤍'}</span>
      <span>{likeCount}</span>
      <span>{liked ? 'Đã thích' : 'Thích'}</span>
    </button>
  )
}
