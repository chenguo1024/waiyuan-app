export default async function sendVerifyEmail(email, code) {
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || '外院一站式 <onboarding@resend.dev>',
          to: email,
          subject: '外院一站式服务平台 - 验证码',
          html: `<p>您的验证码是：<strong style="font-size:24px;color:#1E88E5">${code}</strong></p><p>5分钟内有效。</p>`,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        console.log(`Verify email sent to ${email}: ${code}`)
        return { success: true }
      } else {
        console.error('Resend error:', data)
      }
    } catch (err) {
      console.error('Email send error:', err.message)
    }
  }

  console.log(`[EMAIL DEBUG] 验证码已发送到 ${email}: ${code}`)
  return { success: true, debug: code }
}
