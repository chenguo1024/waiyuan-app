import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, saveToken } from '../store'
import { sendCode, sendEmailCode, register } from '../api/auth'

export default function Register() {
  const [step, setStep] = useState(1)
  const [regType, setRegType] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [idCard, setIdCard] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (regType === 'email') {
      if (!email.includes('@')) { setError('请输入正确的学校邮箱'); return }
    } else {
      if (phone.length < 11) { setError('请输入完整手机号'); return }
    }
    setLoading(true)
    setError('')
    try {
      const res = regType === 'email' ? await sendEmailCode(email) : await sendCode(phone)
      setCodeSent(true)
      setCountdown(60)
      const timer = setInterval(() => setCountdown(c => { if (c <= 1) clearInterval(timer); return c - 1 }), 1000)
      if (res.debug) setError(`验证码: ${res.debug}`)
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
      const params = {
        code, password, name: name.trim(), studentId: studentId.trim(), idCard: idCard.trim(),
        ...(regType === 'email' ? { email } : { phone }),
      }
      const res = await register(params)
      saveToken(res.token)
      dispatch({ type: 'LOGIN', user: res.user })
      setStep(3)
      setTimeout(() => navigate('/home', { replace: true }), 1500)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📝</div>
          <h1>注册账号</h1>
          <p>步骤 {step}/3</p>
        </div>

        <div className="auth-steps">
          {[1, 2, 3].map(s => (
            <div key={s} className={`auth-step ${s <= step ? 'active' : ''}`} />
          ))}
        </div>

        <div className="auth-tabs" style={{ marginBottom: 16 }}>
          <button className={`auth-tab ${regType === 'email' ? 'active' : ''}`} onClick={() => setRegType('email')}>邮箱注册</button>
          <button className={`auth-tab ${regType === 'phone' ? 'active' : ''}`} onClick={() => setRegType('phone')}>手机注册</button>
        </div>

        {error && <p className={`auth-error ${error.includes('验证码:') ? 'debug' : ''}`}>{error}</p>}

        {step === 1 && (
          <>
            {regType === 'email' ? (
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
            <div className="auth-code-row">
              <div className="auth-input-group" style={{ flex: 1 }}>
                <span className="auth-input-icon">✉️</span>
                <input type="text" placeholder="验证码" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
              </div>
              <button className="auth-code-btn" onClick={handleSendCode} disabled={loading || countdown > 0}>
                {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
              </button>
            </div>
            <button className="auth-submit" onClick={handleVerifyCode} disabled={!code}>下一步</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-input-group">
              <span className="auth-input-icon">👤</span>
              <input type="text" placeholder="真实姓名" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="auth-input-group">
              <span className="auth-input-icon">🎓</span>
              <input type="text" placeholder="学号" value={studentId} onChange={e => setStudentId(e.target.value)} />
            </div>
            <div className="auth-input-group">
              <span className="auth-input-icon">🪪</span>
              <input type="text" placeholder="身份证号（选填）" value={idCard} onChange={e => setIdCard(e.target.value)} />
            </div>
            <div className="auth-input-group">
              <span className="auth-input-icon">🔒</span>
              <input type="password" placeholder="设置密码（至少6位）" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="auth-submit" onClick={handleRegister} disabled={loading}>
              {loading ? <span className="auth-loading" /> : '完成注册'}
            </button>
          </>
        )}

        {step === 3 && (
          <div className="auth-success">
            <div className="auth-success-icon">🎉</div>
            <h3>注册成功！</h3>
            <p>正在跳转至首页...</p>
          </div>
        )}

        <div className="auth-links" style={{ marginTop: 16 }}>
          <button onClick={() => navigate('/login')}>已有账号？去登录</button>
        </div>
      </div>
    </div>
  )
}
