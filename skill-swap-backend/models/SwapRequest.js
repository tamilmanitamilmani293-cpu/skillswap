import mongoose from 'mongoose'

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offeredSkill: { type: String, required: true },
    requestedSkill: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      text: { type: String },
    },
  },
  { timestamps: true }
)

export default mongoose.model('SwapRequest', swapRequestSchema)
