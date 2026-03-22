const User = require('../models/User')
const Book = require('../models/Book')
const Issue = require('../models/Issue')
const generateTempPassword = require('../utils/generateTempPassword')
const sendEmail = require('../utils/sendEmail')

const createUser = async (req, res) => {
  const { name, email, role } = req.body

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required' })
  }

  if (!['student', 'staff'].includes(role)) {
    return res.status(400).json({ message: 'Admin can only create student or staff users' })
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() })

  if (existingUser) {
    return res.status(409).json({ message: 'User already exists with this email' })
  }

  const temporaryPassword = generateTempPassword()

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: temporaryPassword,
    role,
    isActive: true,
    isApproved: true,
  })

  const loginUrl = process.env.CLIENT_LOGIN_URL || 'http://localhost:5173/auth/student-login'

  await sendEmail({
    to: user.email,
    subject: 'Library Tracking System Account Created',
    text: `Hello ${user.name}, your account has been created.\nEmail: ${user.email}\nTemporary Password: ${temporaryPassword}\nLogin URL: ${loginUrl}`,
    html: `
      <h2>Library Tracking System Account</h2>
      <p>Hello ${user.name},</p>
      <p>Your account has been created successfully.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
    `,
  })

  return res.status(201).json({
    message: `${role} created successfully`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
    },
    temporaryPassword,
  })
}

const addStudent = async (req, res) => {
  req.body.role = 'student'
  return createUser(req, res)
}

const addStaff = async (req, res) => {
  req.body.role = 'staff'
  return createUser(req, res)
}

const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  return res.status(200).json(users)
}

const getDashboard = async (req, res) => {
  const [totalBooks, totalStudents, totalStaff, issuedBooks, overdueBooks] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'staff' }),
    Issue.countDocuments({ status: 'issued' }),
    Issue.countDocuments({ status: 'overdue' }),
  ])

  return res.status(200).json({
    totalBooks,
    totalStudents,
    totalStaff,
    issuedBooks,
    overdueBooks,
  })
}

const getStudents = async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 })
  return res.status(200).json(students)
}

const getStaff = async (req, res) => {
  const staff = await User.find({ role: 'staff' }).select('-password').sort({ createdAt: -1 })
  return res.status(200).json(staff)
}

const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  user.isApproved = true
  user.isActive = true
  await user.save()

  await sendEmail({
    to: user.email,
    subject: 'Account Approved',
    text: 'Your account has been approved by admin.\nYou can now login using your credentials.',
    html: `
      <h2>Account Approved</h2>
      <p>Your account has been approved by admin.</p>
      <p>You can now login using your credentials.</p>
    `,
  })

  return res.status(200).json({
    message: `${user.role === 'staff' ? 'Staff' : 'Student'} approved successfully`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      isActive: user.isActive,
    },
  })
}

const getReports = async (req, res) => {
  const [issuedBooks, overdueBooks, totalBooks, totalStudents, totalStaff, recentIssues] = await Promise.all([
    Issue.countDocuments({ status: 'issued' }),
    Issue.countDocuments({ status: 'overdue' }),
    Book.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'staff' }),
    Issue.find()
      .populate('studentId', 'name')
      .populate('bookId', 'title')
      .sort({ createdAt: -1 })
      .limit(5),
  ])

  return res.status(200).json({
    issuedBooks,
    overdueBooks,
    activitySummary: `Library has ${totalBooks} books, ${totalStudents} students, and ${totalStaff} staff accounts in the system.`,
    recentIssues: recentIssues.map((item) => ({
      id: item._id,
      student: item.studentId?.name || 'Unknown',
      book: item.bookId?.title || 'Unknown',
      status: item.status,
      issueDate: item.issueDate,
      dueDate: item.dueDate,
    })),
  })
}

const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  user.isActive = !user.isActive
  await user.save()

  return res.status(200).json({
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isApproved: user.isApproved,
    },
  })
}

const deactivateUser = async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  user.isActive = !user.isActive
  await user.save()

  return res.status(200).json({
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isApproved: user.isApproved,
    },
  })
}

module.exports = {
  addStudent,
  addStaff,
  getDashboard,
  getStudents,
  getStaff,
  approveUser,
  getReports,
  getUsers,
  toggleUserStatus,
  deactivateUser,
}
