import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

let sendSMS = async (phone, code) => {
  console.log(`[SMS DEBUG] 验证码已发送到 ${phone}: ${code}`)
  return { success: true }
}

// 如果配置了阿里云短信，则使用真实发送
if (process.env.ALIYUN_ACCESS_KEY_ID) {
  sendSMS = async (phone, code) => {
    try {
      // 这里使用 fetch 调用阿里云短信API
      const response = await fetch('https://dysmsapi.aliyuncs.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PhoneNumbers: phone,
          SignName: process.env.ALIYUN_SMS_SIGN_NAME,
          TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
          TemplateParam: JSON.stringify({ code }),
        }),
      })
      const data = await response.json()
      return data
    } catch (err) {
      console.error('SMS send error:', err)
      return { success: false, error: err.message }
    }
  }
}

export default sendSMS
