const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Issue', issueSchema)
