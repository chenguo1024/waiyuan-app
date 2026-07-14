import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getTasks } from '../api/tasks'
import { getProducts } from '../api/products'
import { getOrders, getNotifications, updateProfile } from '../api/user'

type ProfileTab = 'publish' | 'accept' | 'orders' | 'settings'

export default function Profile() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<ProfileTab>('publish')
  const [toast, setToast] = useState('')
  const [editName, setEditName] = useState(state.user?.name || '')
  const [showEdit, setShowEdit] = useState(false)
  const [uploading, setUploading] = useState(false)
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        if (state.user) {
          await updateProfile(state.user.id, state.user.name, dataUrl)
          dispatch({ type: 'SET_USER', user: { avatar: dataUrl } })
          showToast('✅ 头像已更新')
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (e: any) {
      showToast('上传失败: ' + e.message)
      setUploading(false)
    }
    e.target.value = ''
  }

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
    <div className="page-animate">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" onClick={() => fileRef.current?.click()}>
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="profile-avatar-img" />
            ) : (
              <span>{user.name[0]}</span>
            )}
            <div className="profile-avatar-overlay">
              {uploading ? '...' : '📷'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          {user.membership !== 'none' && <div className="profile-crown">👑</div>}
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h2>{user.name}</h2>
            <button className="profile-edit-btn" onClick={() => { setEditName(user.name); setShowEdit(true) }}>编辑</button>
          </div>
          <p className="profile-meta">{user.studentId} · {user.phone}</p>
          <div className="profile-tags">
            <span className="profile-tag">⭐ 信誉分 {user.creditScore}</span>
            {user.membership !== 'none' && <span className="profile-tag">👑 会员</span>}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat" onClick={() => navigate('/coins')}>
          <p className="profile-stat-value primary">{user.coinBalance}</p>
          <p className="profile-stat-label">🪙 帮帮币</p>
        </div>
        <div className="profile-stat" onClick={() => navigate('/membership')}>
          <p className="profile-stat-value gold">{user.membership !== 'none' ? '已开通' : '未开通'}</p>
          <p className="profile-stat-label">👑 会员</p>
        </div>
        <div className="profile-stat" onClick={() => navigate('/notifications')}>
          <p className="profile-stat-value accent">{unreadNotifs}</p>
          <p className="profile-stat-label">🔔 通知</p>
        </div>
      </div>

      <div className="profile-tabs">
        {([
          { key: 'publish', label: '我的发布' },
          { key: 'accept', label: '我的接单' },
          { key: 'orders', label: '我的订单' },
          { key: 'settings', label: '设置' },
        ] as const).map(t => (
          <button key={t.key} className={`profile-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="profile-loading">加载中...</div>
      ) : (
        <>
          {tab === 'publish' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <span style={{ fontSize: 14, fontWeight: 600 }}>我发布的</span>
                <span className="profile-section-count">任务 {userTasks.length} · 商品 {userProducts.length}</span>
              </div>
              {userTasks.length === 0 && userProducts.length === 0 ? (
                <div className="profile-empty">暂无发布记录</div>
              ) : (
                <>
                  {userTasks.map((t: any) => (
                    <div key={t.id} className="profile-item" onClick={() => navigate(`/errand/${t.id}`)}>
                      <div className="profile-item-row">
                        <span className="profile-item-title">🏃 {t.title}</span>
                        <span className="profile-item-status" style={{ background: statusColor[t.status] || '#E3F2FD', color: statusTextColor[t.status] || 'var(--primary)' }}>
                          {statusLabel[t.status] || t.status}
                        </span>
                      </div>
                      <span className="profile-item-meta">赏金 ¥{t.reward + (t.urgentFee || 0)}</span>
                    </div>
                  ))}
                  {userProducts.map((p: any) => (
                    <div key={p.id} className="profile-item">
                      <div className="profile-item-row">
                        <span className="profile-item-title">🏪 {p.title}</span>
                        <span className="profile-item-price" style={{ color: p.price === 0 ? 'var(--success)' : 'var(--accent)' }}>{p.price === 0 ? '免费' : `¥${p.price}`}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab === 'accept' && (
            <div className="profile-section">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>我接单的任务</h3>
              {acceptedTasks.length === 0 ? (
                <div className="profile-empty">
                  <p style={{ marginBottom: 8 }}>暂无接单记录</p>
                  <button onClick={() => navigate('/errands')} className="profile-action-btn">去接单</button>
                </div>
              ) : (
                acceptedTasks.map((t: any) => (
                  <div key={t.id} className="profile-item" onClick={() => navigate(`/errand/${t.id}`)}>
                    <div className="profile-item-row">
                      <span className="profile-item-title">{t.title}</span>
                      <span className="profile-item-status" style={{ background: statusColor[t.status] || '#E3F2FD', color: statusTextColor[t.status] || 'var(--primary)' }}>
                        {statusLabel[t.status] || t.status}
                      </span>
                    </div>
                    <span className="profile-item-meta">赏金 ¥{t.reward + (t.urgentFee || 0)}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="profile-section">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>购买记录</h3>
              {orders.length === 0 ? (
                <div className="profile-empty">暂无购买记录</div>
              ) : (
                orders.map((o: any) => (
                  <div key={o.id} className="profile-item">
                    <div className="profile-item-row">
                      <span className="profile-item-title">{o.title || o.description}</span>
                      <span className="profile-item-price" style={{ color: 'var(--accent)' }}>¥{o.amount}</span>
                    </div>
                    <span className="profile-item-meta">
                      {o.type ? ({ errand: '跑腿', product: '商品', study: '学习' } as Record<string, string>)[o.type] || o.type : ''} · {o.status === 'completed' ? '已完成' : '进行中'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="profile-settings">
              {[
                { label: '个人资料', onClick: () => setShowEdit(true) },
                { label: '消息通知', onClick: () => navigate('/notifications') },
                { label: '关于我们', onClick: () => showToast('外交学院一站式服务平台 v2.0') },
              ].map((item, i) => (
                <button key={i} className="profile-setting-item" onClick={item.onClick}>
                  {item.label}
                  <span className="profile-arrow">›</span>
                </button>
              ))}
              <button className="profile-logout" onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/login') }}>
                退出登录
              </button>
            </div>
          )}
        </>
      )}

      {showEdit && (
        <div className="profile-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <h3>编辑昵称</h3>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="输入新昵称" className="profile-modal-input" />
            <div className="profile-modal-actions">
              <button className="profile-modal-cancel" onClick={() => setShowEdit(false)}>取消</button>
              <button className="profile-modal-save" onClick={handleSaveName}>保存</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
