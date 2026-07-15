import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

export default async function sendSMS(phone, code) {
  const appid = process.env.SUBMAIL_APPID
  const sign = process.env.SUBMAIL_SIGN || '外院平台'

  if (!appid) {
    console.log(`[SMS DEBUG] 验证码已发送到 ${phone}: ${code}`)
    return { success: true, debug: code }
  }

  const url = 'https://api.mysubmail.com/message/xsend.json'
  const body = {
    appid,
    signature: process.env.SUBMAIL_APPKEY || '',
    to: phone,
    project: process.env.SUBMAIL_PROJECT || '',
    vars: JSON.stringify({ code }),
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.status === 'success') {
      console.log(`SMS sent to ${phone}: ${code}`)
      return { success: true }
    }
    console.error('SMS error:', data)
    return { success: false, error: data.msg || '发送失败' }
  } catch (err) {
    console.error('SMS send error:', err.message)
    return { success: false, error: err.message }
  }
}
