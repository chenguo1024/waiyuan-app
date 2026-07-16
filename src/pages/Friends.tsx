import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getFriends, getFriendRequests, requestFriend, acceptFriend, rejectFriend, searchUser } from '../api/friends'
import { getOrCreateConversation } from '../api/chat'

export default function Friends() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [friends, setFriends] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const load = () => {
    if (!state.user) return
    getFriends(state.user.id).then(setFriends).catch(() => {})
    getFriendRequests(state.user.id).then(setRequests).catch(() => {})
  }

  useEffect(() => { load() }, [state.user])

  const handleSearch = async () => {
    if (!searchQuery.trim() || !state.user) return
    setSearching(true)
    try {
      const results = await searchUser(searchQuery.trim())
      setSearchResults(results.filter((u: any) => u.id !== state.user!.id))
    } catch { showToast('搜索失败') }
    setSearching(false)
  }

  const handleAdd = async (friendId: string) => {
    if (!state.user) return
    try {
      await requestFriend(state.user.id, friendId)
      showToast('好友请求已发送')
      setSearchResults([])
      setSearchQuery('')
    } catch (e: any) { showToast(e.message) }
  }

  const handleAccept = async (friendId: string) => {
    if (!state.user) return
    try {
      await acceptFriend(state.user.id, friendId)
      load()
      showToast('已添加好友')
    } catch { showToast('操作失败') }
  }

  const handleReject = async (friendId: string) => {
    if (!state.user) return
    try {
      await rejectFriend(state.user.id, friendId)
      load()
    } catch {}
  }

  const handleChat = async (friendId: string) => {
    if (!state.user) return
    try {
      const conv = await getOrCreateConversation(state.user.id, friendId)
      navigate(`/chat/${conv.id}`)
    } catch {}
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #43A047, #66BB6A)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>← 返回</button>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>好友</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="搜索用户ID / 手机号 / QQ"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 13, outline: 'none' }} />
          <button onClick={handleSearch} disabled={searching || !searchQuery.trim()}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 600, fontSize: 13, opacity: !searchQuery.trim() ? 0.5 : 1 }}>
            {searching ? '搜索中...' : '搜索'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, marginTop: 8, padding: 8 }}>
            {searchResults.map((u: any) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                <span style={{ fontSize: 13 }}>{u.name || '未命名'} <span style={{ opacity: 0.6 }}>(ID: {u.id})</span></span>
                <button onClick={() => handleAdd(u.id)} style={{ padding: '4px 12px', borderRadius: 6, background: '#fff', color: '#43A047', fontSize: 12, border: 'none', fontWeight: 600 }}>添加</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '0 12px' }}>
        {requests.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12, marginTop: 12, boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>好友请求 ({requests.length})</h3>
            {requests.map((r: any) => (
              <div key={r.requestId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{r.name}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleAccept(r.id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 12, border: 'none' }}>接受</button>
                  <button onClick={() => handleReject(r.id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: 12, border: 'none' }}>拒绝</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, marginTop: 12, marginBottom: 80, boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>好友列表 ({friends.length})</h3>
          {friends.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-light)', textAlign: 'center', padding: 20 }}>还没有好友，搜索ID/手机号/QQ添加</p>
          ) : (
            friends.map((f: any) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                  <span style={{ fontSize: 14 }}>{f.name}</span>
                </div>
                <button onClick={() => handleChat(f.id)} style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 12, border: 'none' }}>发消息</button>
              </div>
            ))
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}