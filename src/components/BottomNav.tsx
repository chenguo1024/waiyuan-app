import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/home', label: '首页', icon: '🏠' },
  { path: '/errands', label: '跑腿', icon: '🏃' },
  { path: '/market', label: '集市', icon: '🏪' },
  { path: '/publish', label: '', icon: '➕', isCenter: true },
  { path: '/study', label: '学习', icon: '📚' },
  { path: '/profile', label: '我的', icon: '👤' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home'
    return location.pathname.startsWith(path)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, width: 375, height: 64,
      background: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'space-around', borderTop: '1px solid var(--border)',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        if (tab.isCenter) {
          return (
            <button
              key="publish"
              onClick={() => navigate('/publish')}
              style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #42A5F5)',
                color: '#fff', fontSize: 28, fontWeight: 300,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(30,136,229,0.4)',
                marginTop: -16, transition: 'transform 0.15s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              +
            </button>
          )
        }
        const active = isActive(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              background: 'none', color: active ? 'var(--primary)' : 'var(--text-light)',
              fontSize: 10, padding: '4px 10px', transition: 'color 0.2s', minWidth: 48,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1.3 }}>{tab.icon}</span>
            <span style={{ fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
