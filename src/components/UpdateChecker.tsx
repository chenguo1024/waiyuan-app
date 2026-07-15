import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import downloadApk from '../plugins/apk-updater'

const CURRENT_VERSION = '2.2.0'

export default function UpdateChecker() {
  const [update, setUpdate] = useState<{ version: string; apkUrl: string; updateUrl: string } | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const checked = sessionStorage.getItem('update_checked')
    if (checked) return

    const base = import.meta.env.VITE_API_URL || window.location.origin + '/api'
    fetch(`${base}/version`)
      .then(r => r.json())
      .then(data => {
        if (data.version && data.version !== CURRENT_VERSION) {
          setUpdate(data)
        }
        sessionStorage.setItem('update_checked', '1')
      })
      .catch(() => {})
  }, [dismissed])

  const handleUpdate = async () => {
    if (!update) return
    if (Capacitor.isNativePlatform() && update.apkUrl) {
      setDownloading(true)
      try {
        await downloadApk(update.apkUrl)
      } catch (e: any) {
        console.error('Auto update failed, opening browser:', e.message)
        window.open(update.updateUrl, '_blank')
      }
      setDownloading(false)
    } else {
      window.open(update.updateUrl, '_blank')
    }
  }

  if (!update || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '12px 20px',
      borderRadius: 12, zIndex: 9999, width: 320, textAlign: 'center',
      animation: 'fadeIn 0.3s ease',
    }}>
      <p style={{ fontSize: 13, marginBottom: 8 }}>
        新版本 v{update.version} 可用
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={handleUpdate}
          disabled={downloading}
          style={{
            padding: '6px 16px', borderRadius: 8,
            background: downloading ? '#666' : 'var(--primary)',
            color: '#fff', fontSize: 12,
          }}
        >{downloading ? '下载中...' : '更新'}</button>
        <button
          onClick={() => setDismissed(true)}
          style={{ padding: '6px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12 }}
        >稍后</button>
      </div>
    </div>
  )
}
