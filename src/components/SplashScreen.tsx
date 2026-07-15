import { useEffect, useState } from 'react'

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0)
      setTimeout(onFinish, 600)
    }, 1500)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D47A1, #1565C0, #1E88E5)',
      opacity, transition: 'opacity 0.6s ease',
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 56, marginBottom: 24, backdropFilter: 'blur(4px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        🏛️
      </div>
      <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, letterSpacing: 4, marginBottom: 8 }}>
        外交学院
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, letterSpacing: 2 }}>
        站稳立场 · 掌握政策 · 熟悉业务 · 严守纪律
      </p>
    </div>
  )
}
