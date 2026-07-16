import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { getWallPosts, createWallPost, deleteWallPost } from '../api/wall'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import { useNavigate } from 'react-router-dom'

export default function Wall() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { load() }, [])

  const load = () => {
    getWallPosts().then(setPosts).catch(() => {})
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handlePost = async () => {
    if (!content.trim() || !state.user) return
    setPosting(true)
    try {
      await createWallPost(state.user.id, state.user.name || '匿名用户', content.trim())
      setContent('')
      load()
      showToast('发布成功')
    } catch { showToast('发布失败') }
    setPosting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    try { await deleteWallPost(id); load(); showToast('已删除') } catch { showToast('删除失败') }
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #8E24AA, #E040FB)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>← 返回</button>
          <h2 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>校园墙</h2>
        </div>
        {state.user && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12 }}>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="说点什么…" rows={3}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 14, resize: 'none', outline: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handlePost} disabled={posting || !content.trim()}
                style={{ padding: '6px 20px', borderRadius: 16, border: 'none', background: '#fff', color: '#8E24AA', fontWeight: 600, fontSize: 13, opacity: posting || !content.trim() ? 0.6 : 1 }}>
                {posting ? '发送中…' : '发布'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 12px', marginTop: 12 }}>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontSize: 14 }}>还没有帖子，快来发第一条</p>
        ) : (
          posts.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{post.userName}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                  {state.user?.id === post.userId && (
                    <button onClick={() => handleDelete(post.id)} style={{ background: 'none', fontSize: 12, color: 'var(--danger)' }}>删除</button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{post.content}</p>
              {post.images.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                  {post.images.map((img: string, i: number) => (
                    <img key={i} src={img} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                {state.user && <LikeButton userId={state.user.id} itemId={post.id} itemType="wall" count={post.likeCount} />}
                <CommentSection itemId={post.id} itemType="wall" />
              </div>
            </div>
          ))
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
