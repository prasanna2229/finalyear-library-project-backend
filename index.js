require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const bookRoutes = require('./routes/bookRoutes')
const issueRoutes = require('./routes/issueRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()
const PORT = process.env.PORT || 5000
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

connectDB()

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Library Tracking System API is running',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/issue', issueRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
