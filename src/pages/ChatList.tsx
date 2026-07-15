import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getConversations } from '../api/chat'

export default function ChatList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!state.user) return
    getConversations(state.user.id).then(data => {
      setConversations(Array.isArray(data) ? data : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [state.user])

  if (!state.user) {
    return <div className="page-animate" style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>请先登录</div>
  }

  return (
    <div className="page-animate">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>
        聊天消息
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>💬</p>
          <p style={{ fontSize: 14 }}>暂无聊天记录</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>在任务详情页可以联系对方</p>
        </div>
      ) : (
        conversations.map(c => (
          <div
            key={c.id}
            className="chat-list-item"
            onClick={() => navigate(`/chat/${c.id}?other=${c.otherUser?.id}&name=${encodeURIComponent(c.otherUser?.name || '')}`)}
          >
            <div className="chat-list-avatar">
              {c.otherUser?.avatar ? (
                <img src={c.otherUser.avatar} alt="" className="chat-list-avatar-img" />
              ) : (
                <span>{(c.otherUser?.name || '?')[0]}</span>
              )}
            </div>
            <div className="chat-list-info">
              <div className="chat-list-name">{c.otherUser?.name || '未知用户'}</div>
              <div className="chat-list-preview">{c.lastMessage}</div>
            </div>
            {c.unread > 0 && <div className="chat-list-badge">{c.unread > 99 ? '99+' : c.unread}</div>}
          </div>
        ))
      )}
    </div>
  )
}
