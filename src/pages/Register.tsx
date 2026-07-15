import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, saveToken } from '../store'
import { register } from '../api/auth'

export default function Register() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [idCard, setIdCard] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (phone.length < 11) { setError('请输入手机号'); return }
    if (password.length < 6) { setError('密码至少6位'); return }
    if (!name.trim()) { setError('请输入真实姓名'); return }
    if (!studentId.trim()) { setError('请输入学号'); return }
    setLoading(true)
    setError('')
    try {
      const res = await register({ phone, password, name: name.trim(), studentId: studentId.trim(), idCard: idCard.trim() })
      saveToken(res.token)
      dispatch({ type: 'LOGIN', user: res.user })
      setDone(true)
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
        </div>

        {error && <p className="auth-error">{error}</p>}

        {done ? (
          <div className="auth-success">
            <div className="auth-success-icon">🎉</div>
            <h3>注册成功！</h3>
            <p>正在跳转至首页...</p>
          </div>
        ) : (
          <>
            <div className="auth-input-group">
              <span className="auth-input-icon">📱</span>
              <input type="tel" placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} />
            </div>
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
              {loading ? <span className="auth-loading" /> : '注册'}
            </button>

            <div className="auth-links" style={{ marginTop: 16 }}>
              <button onClick={() => navigate('/login')}>已有账号？去登录</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
