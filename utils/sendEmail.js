const nodemailer = require('nodemailer')

const createTransporter = () =>
  nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials missing. Skipping email send.')
    return { skipped: true }
  }

  try {
    const transporter = createTransporter()

    return await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    })
  } catch (error) {
    console.error('Email send failed:', error.message)
    return { failed: true, error: error.message }
  }
}

module.exports = sendEmail
