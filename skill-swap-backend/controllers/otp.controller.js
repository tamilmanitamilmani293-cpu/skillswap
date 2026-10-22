import nodemailer from 'nodemailer'
import Otp from '../models/Otp.js'

// Email delivery has two modes:
//  1. Brevo HTTP API  — used automatically when BREVO_API_KEY is set. This is what
//     you use once the site is hosted, because free hosts like Render block the
//     SMTP ports (25/465/587) that Gmail needs.
//  2. Gmail SMTP      — used when BREVO_API_KEY is NOT set (your local laptop setup).
// So the same code works both locally and online.

function buildEmailHtml(code) {
  return `
    <div style="font-family: sans-serif; max-width: 420px; margin: auto;">
      <h2 style="color:#4C3FE0;">SkillSwap</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${code}</p>
      <p style="color:#888; font-size: 13px;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `
}

async function sendViaBrevo(to, subject, html) {
  const { BREVO_API_KEY, BREVO_SENDER_EMAIL } = process.env
  if (!BREVO_SENDER_EMAIL) {
    throw new Error('BREVO_SENDER_EMAIL is not configured on the server.')
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'SkillSwap', email: BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || `Brevo request failed with status ${response.status}.`)
  }
}

async function sendViaGmail(to, subject, html) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('Email is not configured on the server (set BREVO_API_KEY, or GMAIL_USER + GMAIL_APP_PASSWORD).')
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  })
  await transporter.sendMail({
    from: `"SkillSwap" <${GMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

function sendEmail(to, subject, html) {
  return process.env.BREVO_API_KEY
    ? sendViaBrevo(to, subject, html)
    : sendViaGmail(to, subject, html)
}

// POST /api/otp/send — { email }
export async function sendOtp(req, res) {
  try {
    const { email } = req.body
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' })
    }

    const code = String(Math.floor(1000 + Math.random() * 9000))
    const cleanEmail = email.toLowerCase().trim()

    // Remove any previous unused OTPs for this email before creating a new one.
    await Otp.deleteMany({ email: cleanEmail })
    await Otp.create({ email: cleanEmail, code })

    await sendEmail(cleanEmail, 'Your SkillSwap verification code', buildEmailHtml(code))

    res.json({ message: 'OTP sent successfully.' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP.', error: err.message })
  }
}

// POST /api/otp/verify — { email, code }
export async function verifyOtp(req, res) {
  try {
    const { email, code } = req.body
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' })
    }

    const record = await Otp.findOne({ email: email.toLowerCase().trim(), code })
    if (!record) {
      return res.status(400).json({ message: 'Incorrect or expired OTP.' })
    }

    await Otp.deleteMany({ email: email.toLowerCase().trim() }) // single-use
    res.json({ verified: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify OTP.', error: err.message })
  }
}
