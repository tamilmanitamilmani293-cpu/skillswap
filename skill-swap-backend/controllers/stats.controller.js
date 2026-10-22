import User from '../models/User.js'
import SwapRequest from '../models/SwapRequest.js'

// GET /api/stats — aggregate platform-wide numbers for the analytics dashboard.
// Public endpoint since it only returns counts, never personal data.
export async function getStats(req, res) {
  try {
    const users = await User.find().select('teaching learning rating')
    const requests = await SwapRequest.find().select('status')

    const totalUsers = users.length
    const totalRequests = requests.length

    // Requests grouped by status
    const statusCounts = { Pending: 0, Accepted: 0, Rejected: 0, Completed: 0 }
    requests.forEach((r) => {
      if (statusCounts[r.status] !== undefined) statusCounts[r.status] += 1
    })

    // Skills being taught, grouped by category
    const categoryCounts = {}
    users.forEach((u) => {
      u.teaching.forEach((t) => {
        const cat = t.category || 'other'
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      })
    })

    const averageRating = totalUsers
      ? (users.reduce((sum, u) => sum + (u.rating || 0), 0) / totalUsers).toFixed(1)
      : 0

    res.json({
      totalUsers,
      totalRequests,
      completedSwaps: statusCounts.Completed,
      averageRating: Number(averageRating),
      requestsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      skillsByCategory: Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message })
  }
}
