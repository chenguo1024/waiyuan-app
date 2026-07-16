import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import TaskCard from '../components/TaskCard'
import ProductCard from '../components/ProductCard'
import { getTasks } from '../api/tasks'
import { getProducts } from '../api/products'
import { checkin, getCheckinStatus } from '../api/user'

const ADS = [
  { text: '☕ 咖啡屋 · 校内饮品8折' },
  { text: '📚 考试周 · 打印满减优惠' },
  { text: '🍱 食堂外卖 · 新店开业' },
]

const QUICK_LINKS = [
  { path: '/errands', label: '跑腿', icon: '🏃', color: '#1E88E5' },
  { path: '/market', label: '集市', icon: '🏪', color: '#FF7043' },
  { path: '/study', label: '学习', icon: '📚', color: '#4CAF50' },
  { path: '/carpool', label: '拼车', icon: '🚗', color: '#9C27B0' },
  { path: '/coins', label: '帮帮币', icon: '🪙', color: '#FFA000' },
  { path: '/publish', label: '发布', icon: '➕', color: '#F44336' },
]

export default function Home() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [adIndex, setAdIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleCheckin = async () => {
    if (!state.user || checkedIn || checking) return
    setChecking(true)
    try {
      const res = await checkin(state.user.id)
      dispatch({ type: 'SET_USER', user: { ...state.user, coinBalance: (state.user?.coinBalance || 0) + res.coins } })
      setCheckedIn(true)
      setToast('签到成功 +1 🪙')
      setTimeout(() => setToast(''), 2000)
    } catch (e: any) {
      if (e.message.includes('今天已签到')) setCheckedIn(true)
      else setToast(e.message)
      setTimeout(() => setToast(''), 2000)
    }
    setChecking(false)
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getTasks().catch(() => []),
      getProducts().catch(() => []),
    ]).then(([tasksData, productsData]) => {
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setProducts(Array.isArray(productsData) ? productsData : [])
      setLoading(false)
    })
    if (state?.user) {
      getCheckinStatus(state.user.id).then(data => {
        if (data.checkedIn) setCheckedIn(true)
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setAdIndex(i => (i + 1) % ADS.length), 3000)
    return () => clearInterval(timer)
  }, [])

  const items = [
    ...tasks.filter((t: any) => t.status === 'open' || t.status === 'in_progress')
      .map((t: any) => ({ type: 'task' as const, data: t, time: new Date(t.createdAt).getTime() })),
    ...products.map((p: any) => ({ type: 'product' as const, data: p, time: new Date(p.createdAt).getTime() })),
  ].sort((a, b) => b.time - a.time)

  const unreadNotifs = 0

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #42A5F5)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>外院一站式</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/notifications')} style={{ background: 'none', position: 'relative' }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              {unreadNotifs > 0 && <span style={{ position: 'absolute', top: -4, right: -6, background: 'var(--accent)', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 8, lineHeight: '14px' }}>{unreadNotifs}</span>}
            </button>
            {state.user && (
              <>
                <button onClick={handleCheckin} disabled={checking || checkedIn}
                  style={{ background: checkedIn ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: 10, fontSize: 11, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {checkedIn ? '✅ 已签到' : '📌 签到'}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>🪙 {state.user.coinBalance}</span>
                {state.user.membership !== 'none' && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontSize: 11, color: '#fff' }}>👑 会员</span>}
              </>
            )}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
          onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100) }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>🔍</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>搜索跑腿任务、商品…</span>
        </div>

        <div style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.15)', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>{ADS[adIndex].text.split('·')[0].trim()}</span>
            <span style={{ fontSize: 13, color: '#fff' }}>| {ADS[adIndex].text.split('·')[1]?.trim()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 6 }}>
            {ADS.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === adIndex ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 12px', marginTop: -8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
          {QUICK_LINKS.map(link => (
            <button key={link.path} onClick={() => navigate(link.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 8px', background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
              <span style={{ fontSize: 24 }}>{link.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{link.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
            <p style={{ fontSize: 14 }}>加载中...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📭</p>
            <p style={{ fontSize: 14, marginBottom: 12 }}>暂无内容，快去发布第一条吧</p>
            <button onClick={() => navigate('/publish')} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 13 }}>
              发布
            </button>
          </div>
        ) : (
          items.map(item => (
            item.type === 'task'
              ? <TaskCard key={'t' + item.data.id} task={item.data} />
              : <ProductCard key={'p' + item.data.id} product={item.data} />
          ))
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}

      {showSearch && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 8, borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowSearch(false)} style={{ background: 'none', fontSize: 16, padding: '4px 8px' }}>←</button>
            <input ref={searchInputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索跑腿任务、商品…"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none', background: 'var(--bg)', fontSize: 14, outline: 'none' }}
              autoFocus />
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {searchQuery.trim() ? (
              items.filter(i => (i.type === 'task' ? i.data.title : i.data.title).toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontSize: 14 }}>未找到相关内容</p>
              ) : (
                items.filter(i => (i.type === 'task' ? i.data.title : i.data.title).toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                  item.type === 'task'
                    ? <TaskCard key={'t' + item.data.id} task={item.data} />
                    : <ProductCard key={'p' + item.data.id} product={item.data} />
                ))
              )
            ) : (
              <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontSize: 14 }}>输入关键词搜索跑腿任务和商品</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
