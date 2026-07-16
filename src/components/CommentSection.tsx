import { useState, useEffect } from 'react'
import { getComments, addComment } from '../api/comments'
import { useApp } from '../store'

interface Props {
  itemId: string
  itemType: string
}

export default function CommentSection({ itemId, itemType }: Props) {
  const { state } = useApp()
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => {
    getComments(itemId, itemType).then(setComments).catch(() => {})
  }

  useEffect(() => { load() }, [itemId, itemType])

  const handleSubmit = async () => {
    if (!text.trim() || !state.user) return
    setLoading(true)
    try {
      await addComment(state.user.id, state.user.name || '用户', itemId, itemType, text.trim())
      setText('')
      load()
    } catch {}
    setLoading(false)
  }

  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>评论 ({comments.length})</p>
      {state.user && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="写评论…"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none' }} />
          <button onClick={handleSubmit} disabled={loading || !text.trim()}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 12, border: 'none', opacity: loading || !text.trim() ? 0.5 : 1 }}>
            发送
          </button>
        </div>
      )}
      {comments.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>暂无评论</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {comments.map((c: any) => (
            <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{c.userName}</p>
              <p style={{ fontSize: 13 }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
