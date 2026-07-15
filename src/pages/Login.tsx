import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp, saveToken } from '../store'
import { sendCode, sendEmailCode, login, loginWithCode } from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const [authMode, setAuthMode] = useState<'code' | 'password'>('code')
  const [sending, setSending] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (loginType === 'email') {
      if (!email.includes('@')) { setError('请输入正确的学校邮箱'); return }
    } else {
      if (phone.length < 11) { setError('请输入完整手机号'); return }
    }
    setSending(true)
    setError('')
    try {
      const res = loginType === 'email'
        ? await sendEmailCode(email)
        : await sendCode(phone)
      setCodeSent(true)
      setCountdown(60)
      const timer = setInterval(() => setCountdown(c => { if (c <= 1) clearInterval(timer); return c - 1 }), 1000)
      if (res.debug) setError(`验证码: ${res.debug}`)
    } catch (e: any) { setError(e.message) }
    setSending(false)
  }

  const handleLogin = async () => {
    if (loginType === 'email' && !email.includes('@')) {
      setError('请输入邮箱'); setLoading(false); return
    } else if (loginType === 'phone' && phone.length < 11) {
      setError('请输入手机号'); setLoading(false); return
    }
    setLoading(true)
    setError('')
    try {
      let res
      if (authMode === 'code') {
        if (!code) { setError('请输入验证码'); setLoading(false); return }
        const params = loginType === 'email' ? { email, code } : { phone, code }
        res = await loginWithCode(params)
      } else {
        if (!password) { setError('请输入密码'); setLoading(false); return }
        const params = loginType === 'email' ? { email, password } : { phone, password }
        res = await login(params)
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

        <div className="auth-tabs" style={{ marginBottom: 8 }}>
          <button className={`auth-tab ${loginType === 'email' ? 'active' : ''}`} onClick={() => setLoginType('email')}>邮箱登录</button>
          <button className={`auth-tab ${loginType === 'phone' ? 'active' : ''}`} onClick={() => setLoginType('phone')}>手机登录</button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${authMode === 'code' ? 'active' : ''}`} onClick={() => setAuthMode('code')}>验证码登录</button>
          <button className={`auth-tab ${authMode === 'password' ? 'active' : ''}`} onClick={() => setAuthMode('password')}>密码登录</button>
        </div>

        {error && <p className={`auth-error ${error.includes('验证码:') ? 'debug' : ''}`}>{error}</p>}

        {loginType === 'email' ? (
          <div className="auth-input-group">
            <span className="auth-input-icon">📧</span>
            <input type="email" placeholder="学校邮箱 (@cfau.edu.cn)" value={email} onChange={e => setEmail(e.target.value.trim())} />
          </div>
        ) : (
          <div className="auth-input-group">
            <span className="auth-input-icon">📱</span>
            <input type="tel" placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} />
          </div>
        )}

        {authMode === 'code' ? (
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
