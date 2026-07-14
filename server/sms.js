import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import crypto from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

export default async function sendSMS(phone, code) {
  const user = process.env.SMSBAO_USER
  const pass = process.env.SMSBAO_PASS
  const sign = process.env.SMSBAO_SIGN || '外院平台'

  if (!user || !pass) {
    console.log(`[SMS DEBUG] 验证码已发送到 ${phone}: ${code}`)
    return { success: true, debug: code }
  }

  const passMd5 = crypto.createHash('md5').update(pass).digest('hex')
  const content = encodeURIComponent(`【${sign}】您的验证码是${code}，5分钟内有效。`)
  const url = `http://api.smsbao.com/sms?u=${user}&p=${passMd5}&m=${phone}&c=${content}`

  try {
    const res = await fetch(url)
    const text = await res.text()
    const statusMap = {
      '0': '发送成功',
      '30': '密码错误',
      '40': '账号不存在',
      '41': '余额不足',
      '43': 'IP地址限制',
      '50': '内容含有敏感词',
      '51': '手机号错误',
    }
    if (text === '0') {
      console.log(`SMS sent to ${phone}: ${code}`)
      return { success: true }
    }
    console.error('SMS error:', text, statusMap[text] || '未知错误')
    return { success: false, error: statusMap[text] || `短信发送失败(${text})` }
  } catch (err) {
    console.error('SMS send error:', err.message)
    return { success: false, error: err.message }
  }
}
