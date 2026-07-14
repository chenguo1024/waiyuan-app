import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, saveToken } from '../store'
import { sendCode, register } from '../api/auth'

export default function Register() {
  const [step, setStep] = useState(1) // 1: 手机验证 2: 填写资料 3: 完成
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [idCard, setIdCard] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (phone.length < 11) { setError('请输入完整手机号'); return }
    setLoading(true)
    setError('')
    try {
      const res = await sendCode(phone)
      setCodeSent(true)
      if (res.debug) setError(`开发模式验证码: ${res.debug}`)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const handleVerifyCode = () => {
    if (!code) { setError('请输入验证码'); return }
    setError('')
    setStep(2)
  }

  const handleRegister = async () => {
    if (!name.trim()) { setError('请输入真实姓名'); return }
    if (!studentId.trim()) { setError('请输入学号'); return }
    if (password.length < 6) { setError('密码至少6位'); return }
    setLoading(true)
    setError('')
    try {
      const res = await register(phone, code, password, name.trim(), studentId.trim(), idCard.trim())
      saveToken(res.token)
      dispatch({ type: 'LOGIN', user: res.user })
      setStep(3)
      setTimeout(() => navigate('/home', { replace: true }), 1500)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="app-container" style={{ background: 'linear-gradient(180deg, #1E88E5 0%, #1565C0 50%, #0D47A1 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 32 }}>📝</div>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>注册账号</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>步骤 {step}/3</p>
      </div>

      <div style={{ width: '100%', background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24 }}>
        {/* 步骤指示器 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ width: 30, height: 4, borderRadius: 2, background: s <= step ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {error && <p style={{ color: error.includes('开发模式') ? 'var(--text-light)' : 'var(--danger)', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</p>}

        {step === 1 && (
          <>
            <div style={{ marginBottom: 12 }}>
              <input type="tel" placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: 'var(--bg)', fontSize: 15 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input type="text" placeholder="验证码" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ flex: 1, padding: '14px 16px', borderRadius: 10, background: 'var(--bg)', fontSize: 15 }} />
              <button onClick={handleSendCode} disabled={loading}
                style={{ padding: '0 16px', borderRadius: 10, background: codeSent ? 'var(--bg)' : 'var(--primary)', color: codeSent ? 'var(--text-secondary)' : '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {loading ? '发送中' : codeSent ? '重新发送' : '获取验证码'}
              </button>
            </div>
            <button onClick={handleVerifyCode}
              style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 700 }}>
              下一步
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2, display: 'block' }}>真实姓名</label>
              <input type="text" placeholder="请输入真实姓名" value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2, display: 'block' }}>学号</label>
              <input type="text" placeholder="请输入学号" value={studentId} onChange={e => setStudentId(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2, display: 'block' }}>身份证号（选填，用于实名认证）</label>
              <input type="text" placeholder="请输入身份证号" value={idCard} onChange={e => setIdCard(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2, display: 'block' }}>设置密码（至少6位）</label>
              <input type="password" placeholder="设置登录密码" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
            </div>
            <button onClick={handleRegister} disabled={loading}
              style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 700 }}>
              {loading ? '注册中...' : '完成注册'}
            </button>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <span style={{ fontSize: 64, display: 'block', marginBottom: 12 }}>🎉</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>注册成功！</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>正在跳转至首页...</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('/login')} style={{ color: 'var(--primary)', fontSize: 13, background: 'none' }}>
            已有账号？去登录
          </button>
        </div>
      </div>
    </div>
  )
}
