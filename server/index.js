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

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/products', productRoutes)
app.use('/api/study', studyRoutes)
app.use('/api/carpool', carpoolRoutes)
app.use('/api/user', userRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`✅ 外院一站式服务平台后端已启动: http://localhost:${PORT}`)
  console.log(`📱 API 基础路径: http://localhost:${PORT}/api`)
  console.log('⚠️  验证码以 [SMS DEBUG] 形式输出在控制台（未配置阿里云短信时）')
})
