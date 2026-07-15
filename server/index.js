import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import productRoutes from './routes/products.js'
import studyRoutes from './routes/study.js'
import carpoolRoutes from './routes/carpool.js'
import userRoutes from './routes/user.js'
import chatRoutes from './routes/chat.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/products', productRoutes)
app.use('/api/study', studyRoutes)
app.use('/api/carpool', carpoolRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.get('/api/version', (req, res) => {
  res.json({
    version: '2.1.0',
    apkUrl: 'https://github.com/chenguo1024/waiyuan-app/releases/download/v2.1.0/app-debug.apk',
    updateUrl: 'https://github.com/chenguo1024/waiyuan-app/releases',
  })
})

app.listen(PORT, () => {
  console.log(`✅ 外院一站式服务平台后端已启动: http://localhost:${PORT}`)
  console.log(`📱 API 基础路径: http://localhost:${PORT}/api`)
  console.log('⚠️  验证码以 [SMS DEBUG] 形式输出在控制台（未配置短信宝时）')
})
