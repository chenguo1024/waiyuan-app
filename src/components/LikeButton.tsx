import { useState, useEffect } from 'react'
import { getLikeStatus, toggleLike } from '../api/likes'

interface Props {
  userId: string
  itemId: string
  itemType: string
  count: number
  onToggle?: (liked: boolean) => void
}

export default function LikeButton({ userId, itemId, itemType, count, onToggle }: Props) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(count)

  useEffect(() => {
    getLikeStatus(userId, itemId, itemType).then(data => setLiked(data.liked)).catch(() => {})
  }, [userId, itemId, itemType])

  const handleClick = async () => {
    try {
      const res = await toggleLike(userId, itemId, itemType)
      setLiked(res.liked)
      setLikeCount(c => res.liked ? c + 1 : Math.max(0, c - 1))
      onToggle?.(res.liked)
    } catch {}
  }

  return (
    <button onClick={handleClick} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: liked ? '#F44336' : 'var(--text-light)', cursor: 'pointer' }}>
      <span style={{ fontSize: 16 }}>{liked ? '❤️' : '🤍'}</span>
      <span>{likeCount}</span>
    </button>
  )
}
