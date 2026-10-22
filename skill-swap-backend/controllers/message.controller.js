import { Conversation, Message } from '../models/Message.js'

export async function getConversations(req, res) {
  try {
    const conversations = await Conversation.find({ participants: req.userId })
      .populate('participants', '-password')
      .sort({ updatedAt: -1 })

    const withPreview = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversationId: conv._id }).sort({ createdAt: -1 })
        return { ...conv.toObject(), lastMessage }
      })
    )

    res.json(withPreview)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations.', error: err.message })
  }
}

export async function startConversation(req, res) {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ message: 'userId is required.' })

    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, userId], $size: 2 },
    })

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.userId, userId] })
    }

    const populated = await conversation.populate('participants', '-password')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: 'Failed to start conversation.', error: err.message })
  }
}

export async function getMessages(req, res) {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.', error: err.message })
  }
}

export async function sendMessage(req, res) {
  try {
    const { text } = req.body
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required.' })

    const message = await Message.create({
      conversationId: req.params.id,
      sender: req.userId,
      text: text.trim(),
    })

    await Conversation.findByIdAndUpdate(req.params.id, { updatedAt: new Date() })

    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.', error: err.message })
  }
}
