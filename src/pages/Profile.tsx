import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getTasks } from '../api/tasks'
import { getProducts } from '../api/products'
import { getOrders, getNotifications, updateProfile } from '../api/user'

type ProfileTab = 'publish' | 'accept' | 'orders' | 'settings'

export default function Profile() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProfileTab>('publish')
  const [toast, setToast] = useState('')
  const [editName, setEditName] = useState(state.user?.name || '')
  const [showEdit, setShowEdit] = useState(false)
  const [userTasks, setUserTasks] = useState<any[]>([])
  const [acceptedTasks, setAcceptedTasks] = useState<any[]>([])
  const [userProducts, setUserProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [loading, setLoading] = useState(true)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  useEffect(() => {
    if (!state.user) return
    setLoading(true)
    const userId = state.user.id
    Promise.all([
      getTasks(undefined, undefined, userId),
      getTasks(undefined, undefined, undefined, userId),
      getProducts(undefined, userId),
      getOrders(userId),
      getNotifications(userId),
    ]).then(([tasks, accepted, products, ords, notifs]) => {
      setUserTasks(Array.isArray(tasks) ? tasks : [])
      setAcceptedTasks(Array.isArray(accepted) ? accepted : [])
      setUserProducts(Array.isArray(products) ? products : [])
      setOrders(Array.isArray(ords) ? ords : [])
      const ns = Array.isArray(notifs) ? notifs : []
      setUnreadNotifs(ns.filter((n: any) => !n.read).length)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [state.user])

  if (!state.user) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
        <p style={{ fontSize: 40, marginBottom: 8 }}>👤</p>
        <p style={{ fontSize: 14, marginBottom: 16 }}>请先登录</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 14 }}>去登录</button>
      </div>
    )
  }

  const user = state.user

  const handleSaveName = () => {
    if (editName.trim()) {
      updateProfile(user.id, editName.trim()).then(() => {
        dispatch({ type: 'SET_USER', user: { name: editName.trim() } })
        setShowEdit(false)
        showToast('✅ 昵称已更新')
      }).catch((e: any) => showToast('更新失败: ' + e.message))
    }
  }

  const statusLabel: Record<string, string> = { open: '进行中', in_progress: '已接单', completed: '待确认', confirmed: '已完成' }
  const statusColor: Record<string, string> = { open: '#E3F2FD', in_progress: '#FFF8E1', completed: '#E8F5E9', confirmed: '#E8F5E9' }
  const statusTextColor: Record<string, string> = { open: 'var(--primary)', in_progress: '#F57F17', completed: 'var(--success)', confirmed: 'var(--success)' }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #42A5F5)', padding: '24px 16px 30px', borderRadius: '0 0 20px 20px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', position: 'relative' }}>
            {user.name[0]}
            {user.membership !== 'none' && <span style={{ position: 'absolute', top: -2, right: -2, fontSize: 16 }}>👑</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</h2>
              <button onClick={() => { setEditName(user.name); setShowEdit(true) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#fff', cursor: 'pointer' }}>编辑</button>
            </div>
            <p style={{ fontSize: 12, opacity: 0.8 }}>{user.studentId} · {user.phone}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8, fontSize: 11 }}>⭐ 信誉分 {user.creditScore}</span>
              {user.membership !== 'none' && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8, fontSize: 11 }}>👑 会员</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -16 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow-lg)', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
            <div onClick={() => navigate('/coins')} style={{ cursor: 'pointer' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{user.coinBalance}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>🪙 帮帮币</p>
            </div>
            <div onClick={() => navigate('/membership')} style={{ cursor: 'pointer' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#FFA000' }}>{user.membership !== 'none' ? '已开通' : '未开通'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>👑 会员</p>
            </div>
            <div onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{unreadNotifs}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>🔔 通知</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'var(--card)', borderRadius: 8, padding: 3 }}>
          {([
            { key: 'publish', label: '我的发布' },
            { key: 'accept', label: '我的接单' },
            { key: 'orders', label: '我的订单' },
            { key: 'settings', label: '设置' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12, background: tab === t.key ? 'var(--primary)' : 'transparent', color: tab === t.key ? '#fff' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div> : (
          <>
            {tab === 'publish' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>我发布的</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-light)' }}>任务 {userTasks.length} · 商品 {userProducts.length}</span>
                </div>
                {userTasks.length === 0 && userProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)', background: '#fff', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: 14 }}>暂无发布记录</p>
                  </div>
                ) : (
                  <>
                    {userTasks.map((t: any) => (
                      <div key={t.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 12, marginBottom: 8, boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => navigate(`/errand/${t.id}`)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>🏃 {t.title}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: statusColor[t.status] || '#E3F2FD', color: statusTextColor[t.status] || 'var(--primary)' }}>
                            {statusLabel[t.status] || t.status}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>赏金 ¥{t.reward + (t.urgentFee || 0)}</span>
                      </div>
                    ))}
                    {userProducts.map((p: any) => (
                      <div key={p.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 12, marginBottom: 8, boxShadow: 'var(--shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>🏪 {p.title}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: p.price === 0 ? 'var(--success)' : 'var(--accent)' }}>{p.price === 0 ? '免费' : `¥${p.price}`}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {tab === 'accept' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>我接单的任务</h3>
                {acceptedTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)', background: '#fff', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: 14, marginBottom: 8 }}>暂无接单记录</p>
                    <button onClick={() => navigate('/errands')} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 12 }}>去接单</button>
                  </div>
                ) : (
                  acceptedTasks.map((t: any) => (
                    <div key={t.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 12, marginBottom: 8, boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => navigate(`/errand/${t.id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: statusColor[t.status] || '#E3F2FD', color: statusTextColor[t.status] || 'var(--primary)' }}>
                          {statusLabel[t.status] || t.status}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>赏金 ¥{t.reward + (t.urgentFee || 0)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>购买记录</h3>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)', background: '#fff', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: 14 }}>暂无购买记录</p>
                  </div>
                ) : (
                  orders.map((o: any) => (
                    <div key={o.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 12, marginBottom: 8, boxShadow: 'var(--shadow)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{o.title || o.description}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>¥{o.amount}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {o.type ? ({ errand: '跑腿', product: '商品', study: '学习' } as Record<string, string>)[o.type] || o.type : ''} · {o.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                {[
                  { label: '个人资料', onClick: () => setShowEdit(true) },
                  { label: '消息通知', onClick: () => navigate('/notifications') },
                  { label: '关于我们', onClick: () => showToast('外交学院一站式服务平台 v2.0') },
                ].map((item, i) => (
                  <button key={i} onClick={item.onClick} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#fff', fontSize: 14, color: 'var(--text)', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', textAlign: 'left' }}>
                    {item.label}
                    <span style={{ color: 'var(--text-light)', fontSize: 16 }}>›</span>
                  </button>
                ))}
                <button onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/login') }} style={{ width: '100%', padding: '14px 16px', background: '#fff', fontSize: 14, color: 'var(--danger)', borderTop: '8px solid var(--bg)' }}>
                  退出登录
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 300, background: '#fff', borderRadius: 16, padding: 24 }}>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>编辑昵称</h3>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="输入新昵称"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowEdit(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: 14 }}>取消</button>
              <button onClick={handleSaveName} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 600 }}>保存</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
