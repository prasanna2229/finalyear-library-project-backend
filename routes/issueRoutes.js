const express = require('express')
const {
  issueBook,
  returnBook,
  renewBook,
  getStudentIssues,
  getIssues,
} = require('../controllers/issueController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', authMiddleware, getIssues)
router.get('/student/:id', authMiddleware, getStudentIssues)
router.post('/', authMiddleware, roleMiddleware('admin', 'staff'), issueBook)
router.post('/return', authMiddleware, roleMiddleware('admin', 'staff', 'student'), returnBook)
router.patch('/:id/return', authMiddleware, roleMiddleware('admin', 'staff'), returnBook)
router.patch('/renew/:id', authMiddleware, roleMiddleware('admin', 'staff'), renewBook)

module.exports = router
