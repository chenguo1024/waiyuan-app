import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp, saveToken } from '../store'
import { sendCode, login, loginWithCode } from '../api/auth'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'code' | 'password'>('code')
  const [sending, setSending] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (phone.length < 11) { setError('请输入完整手机号'); return }
    setSending(true)
    setError('')
    try {
      const res = await sendCode(phone)
      setCodeSent(true)
      setCountdown(60)
      const timer = setInterval(() => setCountdown(c => { if (c <= 1) clearInterval(timer); return c - 1 }), 1000)
      if (res.debug) setError(`验证码: ${res.debug}`)
    } catch (e: any) {
      setError(e.message)
    }
    setSending(false)
  }

  const handleLogin = async () => {
    if (phone.length < 11) { setError('请输入手机号'); return }
    setLoading(true)
    setError('')
    try {
      let res
      if (mode === 'code') {
        if (!code) { setError('请输入验证码'); setLoading(false); return }
        res = await loginWithCode(phone, code)
      } else {
        if (!password) { setError('请输入密码'); setLoading(false); return }
        res = await login(phone, password)
      }
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

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'code' ? 'active' : ''}`} onClick={() => setMode('code')}>验证码登录</button>
          <button className={`auth-tab ${mode === 'password' ? 'active' : ''}`} onClick={() => setMode('password')}>密码登录</button>
        </div>

        {error && <p className={`auth-error ${error.includes('验证码:') ? 'debug' : ''}`}>{error}</p>}

        <div className="auth-input-group">
          <span className="auth-input-icon">📱</span>
          <input type="tel" placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} />
        </div>

        {mode === 'code' ? (
          <div className="auth-code-row">
            <div className="auth-input-group" style={{ flex: 1 }}>
              <span className="auth-input-icon">✉️</span>
              <input type="text" placeholder="验证码" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            </div>
            <button className="auth-code-btn" onClick={handleSendCode} disabled={sending || countdown > 0}>
              {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
            </button>
          </div>
        ) : (
          <div className="auth-input-group">
            <span className="auth-input-icon">🔒</span>
            <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        )}

        <button className="auth-submit" onClick={handleLogin} disabled={loading}>
          {loading ? <span className="auth-loading" /> : '登录'}
        </button>

        <div className="auth-links">
          <Link to="/register">注册账号</Link>
          <span className="auth-divider">|</span>
          <button onClick={() => navigate('/register')}>忘记密码</button>
        </div>

        <p className="auth-agreement">登录即代表同意《用户协议》和《隐私政策》</p>
      </div>
    </div>
  )
}
