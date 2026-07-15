import pkg from '../../package.json'

export default function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 340, borderRadius: 16 }}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏛️</div>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>外院一站式服务平台</h2>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16 }}>v{pkg.version}</p>

          <div style={{ textAlign: 'left', fontSize: 13, lineHeight: 1.8, color: '#333' }}>
            <p>本平台为外交学院校内综合服务 App，提供跑腿代取、二手交易、学习资料分享、拼车出行等功能。</p>
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
            <p><strong>开发者</strong><br />中国科学技术大学 · 陈果</p>
            <p style={{ marginTop: 8 }}><strong>联系方式</strong><br />邮箱：chenguo1024@mail.ustc.edu.cn</p>
            <p style={{ marginTop: 8 }}><strong>特别感谢</strong><br />外交学院网络信息中心</p>
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: 16, padding: '8px 32px', borderRadius: 20,
              background: 'var(--primary)', color: '#fff', fontSize: 14, border: 'none',
            }}
          >关闭</button>
        </div>
      </div>
    </div>
  )
}
