import User from '../models/User.js'

export async function getUsers(req, res) {
  try {
    const { search, category } = req.query
    const query = {}

    if (category) {
      query['teaching.category'] = category
    }

    if (search) {
      const regex = new RegExp(search, 'i')
      query.$or = [{ name: regex }, { 'teaching.skill': regex }, { 'learning.skill': regex }]
    }

    const users = await User.find(query).select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message })
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.', error: err.message })
  }
}

export async function updateMe(req, res) {
  try {
    const allowedFields = ['name', 'bio', 'location', 'availability', 'avatar', 'teaching', 'learning']
    const updates = {}
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    })

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.', error: err.message })
  }
}
