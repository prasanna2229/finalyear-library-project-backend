const express = require('express')
const {
  addBook,
  getBooks,
  updateBook,
  deleteBook,
} = require('../controllers/bookController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', authMiddleware, getBooks)
router.post('/', authMiddleware, roleMiddleware('admin'), addBook)
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateBook)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteBook)

module.exports = router
