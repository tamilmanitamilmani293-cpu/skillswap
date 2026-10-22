import SwapRequest from '../models/SwapRequest.js'

export async function createRequest(req, res) {
  try {
    const { toUser, offeredSkill, requestedSkill, message } = req.body

    if (!toUser || !offeredSkill || !requestedSkill) {
      return res.status(400).json({ message: 'toUser, offeredSkill and requestedSkill are required.' })
    }

    const request = await SwapRequest.create({
      fromUser: req.userId,
      toUser,
      offeredSkill,
      requestedSkill,
      message,
    })

    const populated = await request.populate(['fromUser', 'toUser'], '-password')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: 'Failed to send request.', error: err.message })
  }
}

export async function getSentRequests(req, res) {
  try {
    const requests = await SwapRequest.find({ fromUser: req.userId })
      .populate('fromUser toUser', '-password')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sent requests.', error: err.message })
  }
}

export async function getReceivedRequests(req, res) {
  try {
    const requests = await SwapRequest.find({ toUser: req.userId })
      .populate('fromUser toUser', '-password')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch received requests.', error: err.message })
  }
}

export async function updateRequestStatus(req, res) {
  try {
    const { status } = req.body
    const allowed = ['Accepted', 'Rejected', 'Completed']
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` })
    }

    const request = await SwapRequest.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'fromUser toUser',
      '-password'
    )
    if (!request) return res.status(404).json({ message: 'Request not found.' })
    res.json(request)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update request.', error: err.message })
  }
}

export async function submitReview(req, res) {
  try {
    const { rating, text } = req.body
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' })
    }

    const request = await SwapRequest.findByIdAndUpdate(
      req.params.id,
      { review: { rating, text } },
      { new: true }
    ).populate('fromUser toUser', '-password')

    if (!request) return res.status(404).json({ message: 'Request not found.' })
    res.json(request)
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review.', error: err.message })
  }
}
