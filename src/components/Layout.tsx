import { useState, useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import UpdateChecker from './UpdateChecker'

const ADS = [
  { text: '☕ 咖啡屋 · 校内饮品8折' },
  { text: '📚 考试周 · 打印满减优惠' },
  { text: '🍱 食堂外卖 · 新店开业' },
]

export default function Layout() {
  const location = useLocation()
  const [adIndex, setAdIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setAdIndex(i => (i + 1) % ADS.length), 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="app-container">
      <div className="top-banner">
        <span className="top-banner-text">{ADS[adIndex].text}</span>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 3 }}>
          {ADS.map((_, i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === adIndex ? 'var(--primary)' : 'rgba(30,136,229,0.2)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>
      <div className="page-content" style={{ paddingTop: 4 }}>
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </div>
      <UpdateChecker />
      <BottomNav />
    </div>
  )
}