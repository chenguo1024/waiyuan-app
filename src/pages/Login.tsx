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
      if (res.debug) setError(`验证码: ${res.debug}（开发模式）`)
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
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="app-container" style={{ background: 'linear-gradient(180deg, #1E88E5 0%, #1565C0 50%, #0D47A1 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40 }}>
          🏛️
        </div>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>外院一站式服务平台</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>外交学院校内综合服务</p>
      </div>

      <div style={{ width: '100%', background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', marginBottom: 20, background: 'var(--bg)', borderRadius: 10, padding: 3 }}>
          {[{ key: 'code', label: '验证码登录' }, { key: 'password', label: '密码登录' }].map(m => (
            <button key={m.key} onClick={() => setMode(m.key as any)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: mode === m.key ? '#fff' : 'transparent', color: mode === m.key ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: mode === m.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {m.label}
            </button>
          ))}
        </div>

        {error && <p style={{ color: error.includes('验证码:') ? 'var(--text-light)' : 'var(--danger)', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</p>}

        <div style={{ marginBottom: 12 }}>
          <input type="tel" placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: 'var(--bg)', fontSize: 15 }} />
        </div>

        {mode === 'code' ? (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input type="text" placeholder="验证码" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ flex: 1, padding: '14px 16px', borderRadius: 10, background: 'var(--bg)', fontSize: 15 }} />
            <button onClick={handleSendCode} disabled={sending}
              style={{ padding: '0 16px', borderRadius: 10, background: codeSent ? 'var(--bg)' : 'var(--primary)', color: codeSent ? 'var(--text-secondary)' : '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {sending ? '发送中' : codeSent ? '重新发送' : '获取验证码'}
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: 'var(--bg)', fontSize: 15 }} />
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 4px 15px rgba(30,136,229,0.3)' }}>
          {loading ? '登录中...' : '登录'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
          <Link to="/register" style={{ color: 'var(--primary)', fontSize: 13 }}>注册账号</Link>
          <span style={{ color: 'var(--text-light)', fontSize: 13 }}>|</span>
          <button onClick={() => navigate('/register')} style={{ color: 'var(--primary)', fontSize: 13, background: 'none' }}>忘记密码</button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-light)', marginTop: 12 }}>
          登录即代表同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  )
}
