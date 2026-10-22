import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })

const toSafeUser = (user) => {
  const obj = user.toObject()
  delete obj.password
  return obj
}

export async function register(req, res) {
  try {
    const { name, email, password, phone, gender } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      gender,
    })

    const token = signToken(user._id)
    res.status(201).json({ token, user: toSafeUser(user) })
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = signToken(user._id)
    res.json({ token, user: toSafeUser(user) })
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message })
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(toSafeUser(user))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile.', error: err.message })
  }
}
