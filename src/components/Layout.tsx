import { useLocation, Outlet, useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'
import UpdateChecker from './UpdateChecker'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  const adTexts = [
    { text: '📢 新用户注册送10帮帮币', link: '/coins' },
    { text: '💡 任务加急仅需1帮帮币', link: '/membership' },
    { text: '🏪 闲置物品免费发布', link: '/publish' },
  ]
  const ad = adTexts[Math.floor(Math.random() * adTexts.length)]

  return (
    <div className="app-container">
      <div className="top-banner" onClick={() => navigate(ad.link)}>
        <span className="top-banner-text">{ad.text}</span>
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
