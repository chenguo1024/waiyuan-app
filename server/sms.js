import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

let sendSMS = async (phone, code) => {
  console.log(`[SMS DEBUG] 验证码已发送到 ${phone}: ${code}`)
  return { success: true }
}

if (process.env.ALIYUN_ACCESS_KEY_ID && process.env.ALIYUN_ACCESS_KEY_SECRET) {
  try {
    const Dysmsapi = require('@alicloud/dysmsapi20170525').default
    const { OpenApiConfig } = require('@alicloud/openapi-core')

    const config = new OpenApiConfig({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'dysmsapi.aliyuncs.com',
    })

    const client = new Dysmsapi(config)

    sendSMS = async (phone, code) => {
      try {
        const request = {
          phoneNumbers: phone,
          signName: process.env.ALIYUN_SMS_SIGN_NAME || '外院平台',
          templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_000000',
          templateParam: JSON.stringify({ code }),
        }
        const response = await client.sendSms(request)
        console.log('SMS sent:', response)
        return response
      } catch (err) {
        console.error('SMS send error:', err)
        return { success: false, error: err.message }
      }
    }
  } catch (e) {
    console.warn('Aliyun SMS SDK not available, using debug mode:', e.message)
  }
}

export default sendSMS
