import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ErrandList from './pages/ErrandList'
import ErrandDetail from './pages/ErrandDetail'
import MarketList from './pages/MarketList'
import MarketDetail from './pages/MarketDetail'
import Study from './pages/Study'
import Carpool from './pages/Carpool'
import Publish from './pages/Publish'
import Membership from './pages/Membership'
import CoinCenter from './pages/CoinCenter'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp()
  if (!state.isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { state } = useApp()
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={state.isLoggedIn ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={state.isLoggedIn ? <Navigate to="/home" replace /> : <Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="errands" element={<ErrandList />} />
          <Route path="errand/:id" element={<ErrandDetail />} />
          <Route path="market" element={<MarketList />} />
          <Route path="market/:id" element={<MarketDetail />} />
          <Route path="study" element={<Study />} />
          <Route path="carpool" element={<Carpool />} />
          <Route path="publish" element={<Publish />} />
          <Route path="membership" element={<Membership />} />
          <Route path="coins" element={<CoinCenter />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
