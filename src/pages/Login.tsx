import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp, saveToken } from '../store'
import { login } from '../api/auth'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (phone.length < 11) { setError('请输入手机号'); return }
    if (!password) { setError('请输入密码'); return }
    setLoading(true)
    setError('')
    try {
      const res = await login({ phone, password })
      saveToken(res.token)
      dispatch({ type: 'LOGIN', user: res.user })
      if (!res.user.studentId) {
        navigate('/register', { replace: true })
      } else {
        navigate('/home', { replace: true })
      }
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏛️</div>
          <h1>外院一站式</h1>
          <p>外交学院校内综合服务</p>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-input-group">
          <span className="auth-input-icon">📱</span>
          <input type="tel" placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} />
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon">🔒</span>
          <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button className="auth-submit" onClick={handleLogin} disabled={loading}>
          {loading ? <span className="auth-loading" /> : '登录'}
        </button>

        <div className="auth-links">
          <Link to="/register">注册账号</Link>
        </div>

        <p className="auth-agreement">登录即代表同意《用户协议》和《隐私政策》</p>
      </div>
    </div>
  )
}
