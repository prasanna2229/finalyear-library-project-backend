const Book = require('../models/Book')
const Issue = require('../models/Issue')
const User = require('../models/User')

const issueBook = async (req, res) => {
  const { studentId, bookId, issueDate, dueDate } = req.body

  if (!studentId || !bookId || !issueDate || !dueDate) {
    return res.status(400).json({ message: 'studentId, bookId, issueDate, and dueDate are required' })
  }

  const student = await User.findOne({ _id: studentId, role: 'student' })

  if (!student) {
    return res.status(404).json({ message: 'Student not found' })
  }

  const book = await Book.findById(bookId)

  if (!book) {
    return res.status(404).json({ message: 'Book not found' })
  }

  if (book.quantity < 1) {
    return res.status(400).json({ message: 'Book is out of stock' })
  }

  const issue = await Issue.create({
    studentId,
    bookId,
    issueDate,
    dueDate,
    status: new Date(dueDate) < new Date() ? 'overdue' : 'issued',
  })

  book.quantity -= 1
  await book.save()

  const populatedIssue = await Issue.findById(issue._id)
    .populate('studentId', 'name email role')
    .populate('bookId', 'title author category')

  return res.status(201).json({
    message: 'Book issued successfully',
    issue: populatedIssue,
  })
}

const returnBook = async (req, res) => {
  const issueId = req.params.id || req.body.issueId
  const issue = await Issue.findById(issueId)

  if (!issue) {
    return res.status(404).json({ message: 'Issue record not found' })
  }

  if (issue.status === 'returned') {
    return res.status(400).json({ message: 'Book already returned' })
  }

  issue.status = 'returned'
  issue.returnDate = new Date()
  await issue.save()

  const book = await Book.findById(issue.bookId)

  if (book) {
    book.quantity += 1
    await book.save()
  }

  const populatedIssue = await Issue.findById(issue._id)
    .populate('studentId', 'name email')
    .populate('bookId', 'title author')

  return res.status(200).json({
    message: 'Book returned successfully',
    issue: populatedIssue,
  })
}

const renewBook = async (req, res) => {
  const issue = await Issue.findById(req.params.id)

  if (!issue) {
    return res.status(404).json({ message: 'Issue record not found' })
  }

  if (issue.status === 'returned') {
    return res.status(400).json({ message: 'Returned book cannot be renewed' })
  }

  const { dueDate } = req.body
  issue.dueDate = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  issue.status = new Date(issue.dueDate) < new Date() ? 'overdue' : 'issued'
  await issue.save()

  const populatedIssue = await Issue.findById(issue._id)
    .populate('studentId', 'name email')
    .populate('bookId', 'title author')

  return res.status(200).json({
    message: 'Book renewed successfully',
    issue: populatedIssue,
  })
}

const getStudentIssues = async (req, res) => {
  const issues = await Issue.find({ studentId: req.params.id, status: { $ne: 'returned' } })
    .populate('bookId', 'title author category')
    .sort({ createdAt: -1 })

  const normalized = issues.map((item) => ({
    _id: item._id,
    studentId: item.studentId,
    bookId: item.bookId?._id,
    title: item.bookId?.title || 'Unknown',
    author: item.bookId?.author || 'Unknown',
    category: item.bookId?.category || 'Unknown',
    issueDate: item.issueDate,
    dueDate: item.dueDate,
    status: item.status,
  }))

  return res.status(200).json(normalized)
}

const getIssues = async (req, res) => {
  const issues = await Issue.find()
    .populate('studentId', 'name email role')
    .populate('bookId', 'title author category')
    .sort({ createdAt: -1 })

  return res.status(200).json(issues)
}

module.exports = {
  issueBook,
  returnBook,
  renewBook,
  getStudentIssues,
  getIssues,
}
