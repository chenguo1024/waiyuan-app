import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getMessages, sendMessage, markConversationRead } from '../api/chat'

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const otherId = searchParams.get('other') || ''
  const otherName = searchParams.get('name') || '对方'
  const { state } = useApp()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!id || !state.user) return
    const fetch = () => {
      getMessages(id!).then(data => {
        setMessages(Array.isArray(data) ? data : [])
        markConversationRead(id!, state.user!.id)
      }).catch(() => {})
    }
    fetch()
    setLoading(false)
    pollRef.current = setInterval(fetch, 3000)
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [id, state.user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !state.user || !otherId || sending) return
    setSending(true)
    try {
      await sendMessage(state.user.id, otherId, text.trim())
      setText('')
      const data = await getMessages(id!)
      setMessages(Array.isArray(data) ? data : [])
    } catch (e: any) {
      console.error(e.message)
    }
    setSending(false)
  }

  if (!state.user) {
    return <div className="page-animate" style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>请先登录</div>
  }

  return (
    <div className="page-animate chat-room">
      <div className="chat-room-header">
        <button className="chat-room-back" onClick={() => navigate('/chat')}>&larr;</button>
        <span className="chat-room-name">{otherName}</span>
      </div>

      <div className="chat-room-messages">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}>
            <p>开始聊天吧</p>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.senderId === state.user!.id
            return (
              <div key={m.id} className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                <div className={`chat-bubble-content ${isMe ? 'me' : 'other'}`}>{m.content}</div>
                <div className="chat-bubble-time">{new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-room-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="输入消息..."
          className="chat-room-input-field"
        />
        <button className="chat-room-send" onClick={handleSend} disabled={sending || !text.trim()}>
          {sending ? '...' : '发送'}
        </button>
      </div>
    </div>
  )
}
