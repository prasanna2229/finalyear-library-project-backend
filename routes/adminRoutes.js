const express = require('express')
const {
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
} = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authMiddleware, roleMiddleware('admin'))

router.get('/dashboard', getDashboard)
router.get('/students', getStudents)
router.get('/staff', getStaff)
router.patch('/approve/:id', approveUser)
router.patch('/deactivate/:id', deactivateUser)
router.get('/reports', getReports)
router.post('/students', addStudent)
router.post('/staff', addStaff)
router.get('/users', getUsers)
router.patch('/users/:id/toggle-status', toggleUserStatus)

module.exports = router
