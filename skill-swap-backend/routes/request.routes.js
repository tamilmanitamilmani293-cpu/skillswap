import express from 'express'
import {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  updateRequestStatus,
  submitReview,
} from '../controllers/request.controller.js'
import requireAuth from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(requireAuth)

router.post('/', createRequest)
router.get('/sent', getSentRequests)
router.get('/received', getReceivedRequests)
router.patch('/:id', updateRequestStatus)
router.patch('/:id/review', submitReview)

export default router
