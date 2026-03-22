const express = require('express')
const { login, register, testEmail } = require('../controllers/authController')

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.get('/test-email', testEmail)

module.exports = router
