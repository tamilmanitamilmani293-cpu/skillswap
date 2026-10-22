import express from 'express'
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} from '../controllers/message.controller.js'
import requireAuth from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', getConversations)
router.post('/', startConversation)
router.get('/:id/messages', getMessages)
router.post('/:id/messages', sendMessage)

export default router
