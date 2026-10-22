import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import requestRoutes from './routes/request.routes.js'
import messageRoutes from './routes/message.routes.js'
import otpRoutes from './routes/otp.routes.js'
import statsRoutes from './routes/stats.routes.js'
import chatRoutes from './routes/chat.routes.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/conversations', messageRoutes)
app.use('/api/otp', otpRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/chat', chatRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 SkillSwap backend running on http://localhost:${PORT}`))
})
