import express from 'express'
import { getUsers, getUserById, updateMe } from '../controllers/user.controller.js'
import requireAuth from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', getUsers)
router.put('/me', requireAuth, updateMe)
router.get('/:id', getUserById)

export default router
