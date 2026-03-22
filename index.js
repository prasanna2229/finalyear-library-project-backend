require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

// Routes
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const bookRoutes = require('./routes/bookRoutes')
const issueRoutes = require('./routes/issueRoutes')

// Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

// ======================
// ✅ CONNECT DATABASE
// ======================
connectDB()

// ======================
// ✅ CORS FIX (IMPORTANT)
// ======================
app.use(cors({
  origin: '*', // allow all (for production Netlify + mobile)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// ======================
// ✅ BODY PARSER
// ======================
app.use(express.json())

// ======================
// ✅ TEST ROUTE
// ======================
app.get('/', (req, res) => {
  res.json({
    message: 'Library Tracking System API is running 🚀',
  })
})

// ======================
// ✅ API ROUTES
// ======================
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/issue', issueRoutes) // optional (can remove later)

// ======================
// ✅ ERROR HANDLING
// ======================
app.use(notFound)
app.use(errorHandler)

// ======================
// ✅ SERVER START
// ======================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})