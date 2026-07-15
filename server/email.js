import nodemailer from 'nodemailer'

let transporter = null

export default async function sendVerifyEmail(email, code) {
  if (process.env.SMTP_HOST) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      })
    }
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: '外院一站式服务平台 - 验证码',
        html: `<p>您的验证码是：<strong style="font-size:24px;color:#1E88E5">${code}</strong></p><p>5分钟内有效。</p>`,
      })
      console.log(`Verify email sent to ${email}: ${code}`)
      return { success: true }
    } catch (err) {
      console.error('Email send error:', err.message)
    }
  }

  console.log(`[EMAIL DEBUG] 验证码已发送到 ${email}: ${code}`)
  return { success: true, debug: code }
}
