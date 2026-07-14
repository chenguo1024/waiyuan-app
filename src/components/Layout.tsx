import { useLocation, Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="app-container">
      <div className="page-content">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
