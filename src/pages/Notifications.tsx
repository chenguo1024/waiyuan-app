import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { timeAgo } from '../mock'
import { getNotifications, markNotificationRead } from '../api/user'

export default function Notifications() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!state.user) { setLoading(false); return }
    getNotifications(state.user.id).then(data => {
      setNotifications(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [state.user])

  const unread = notifications.filter((n: any) => !n.read).length

  const handleRead = (id: string) => {
    markNotificationRead(id).then(() => {
      setNotifications(notifications.map((n: any) => n.id === id ? { ...n, read: true } : n))
    }).catch(() => {})
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #42A5F5)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
          ← 返回
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>🔔</span>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>消息通知</h2>
          {unread > 0 && (
            <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>
              {unread} 条未读
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '0 12px', marginTop: -8 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div>
          : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>🔔</p>
              <p style={{ fontSize: 14 }}>暂无通知</p>
            </div>
          ) : (
            notifications.map((n: any) => (
              <div key={n.id} onClick={() => handleRead(n.id)}
                style={{ background: n.read ? '#fff' : '#E3F2FD', borderRadius: 'var(--radius)', padding: 14, marginBottom: 8, boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{n.type === 'system' ? '🔔' : n.type === 'task' ? '🏃' : '🛒'}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{n.title}</span>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.message}</p>
                <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{timeAgo(n.createdAt)}</span>
              </div>
            ))
          )}
      </div>
    </div>
  )
}
