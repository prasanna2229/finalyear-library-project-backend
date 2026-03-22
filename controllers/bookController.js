const Book = require('../models/Book')

const addBook = async (req, res) => {
  const { title, author, category, quantity } = req.body

  if (!title || !author || !category || quantity === undefined) {
    return res.status(400).json({ message: 'Title, author, category, and quantity are required' })
  }

  const book = await Book.create({ title, author, category, quantity })

  return res.status(201).json({
    message: 'Book added successfully',
    book,
  })
}

const getBooks = async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 })
  return res.status(200).json(books)
}

const updateBook = async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!book) {
    return res.status(404).json({ message: 'Book not found' })
  }

  return res.status(200).json({
    message: 'Book updated successfully',
    book,
  })
}

const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id)

  if (!book) {
    return res.status(404).json({ message: 'Book not found' })
  }

  await book.deleteOne()
  return res.status(200).json({ message: 'Book deleted successfully' })
}

module.exports = {
  addBook,
  getBooks,
  updateBook,
  deleteBook,
}
