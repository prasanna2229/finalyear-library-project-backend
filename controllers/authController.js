const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')

const ADMIN_EMAIL = 'roshinikumar2020@gmail.com'
const ADMIN_PASSWORD = 'Roshini@2026'

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' })
    }

    if (!['student', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Only student or staff can register' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' })
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      isActive: true,
      isApproved: false,
    })

    await sendEmail({
      to: user.email,
      subject: 'Registration Successful',
      text: 'Your account has been created successfully.\nPlease wait for admin approval.',
      html: `
        <h2>Registration Successful</h2>
        <p>Your account has been created successfully.</p>
        <p>Please wait for admin approval.</p>
      `,
    })

    return res.status(201).json({
      message: 'Your request is sent to admin for approval',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration failed' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase()

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      let adminUser = await User.findOne({ email: normalizedEmail })

      if (!adminUser) {
        adminUser = await User.create({
          name: 'Roshini Kumar',
          email: normalizedEmail,
          password: ADMIN_PASSWORD,
          role: 'admin',
          isActive: true,
          isApproved: true,
        })
      } else {
        let shouldSave = false
        if (adminUser.role !== 'admin') {
          adminUser.role = 'admin'
          shouldSave = true
        }
        if (!adminUser.isActive) {
          adminUser.isActive = true
          shouldSave = true
        }
        if (!adminUser.isApproved) {
          adminUser.isApproved = true
          shouldSave = true
        }
        if (shouldSave) {
          await adminUser.save()
        }
      }

      return res.status(200).json({
        message: 'Login successful',
        token: generateToken(adminUser),
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          isActive: adminUser.isActive,
          isApproved: adminUser.isApproved,
          createdAt: adminUser.createdAt,
        },
      })
    }

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is deactivated' })
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is not approved. Please contact admin.' })
    }

    return res.status(200).json({
      message: 'Login successful',
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed' })
  }
}

const testEmail = async (req, res) => {
  const targetEmail = req.query.email || process.env.EMAIL_USER

  if (!targetEmail) {
    return res.status(400).json({ message: 'Target email is required' })
  }

  const result = await sendEmail({
    to: targetEmail,
    subject: 'Library Tracking System Test Email',
    text: 'This is a sample email to verify your Nodemailer setup.',
    html: `
      <h2>Library Tracking System</h2>
      <p>This is a sample email to verify your Nodemailer setup.</p>
    `,
  })

  return res.status(200).json({
    message: 'Test email request processed',
    result,
  })
}

module.exports = { login, register, testEmail }
