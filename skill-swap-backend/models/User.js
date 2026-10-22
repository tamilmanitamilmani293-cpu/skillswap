import mongoose from 'mongoose'

const skillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    category: { type: String, default: 'programming' },
    level: { type: String, default: 'Beginner' },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    avatar: { type: String, default: 'https://i.pravatar.cc/150' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    availability: { type: String, default: '' },
    teaching: { type: [skillSchema], default: [] },
    learning: { type: [skillSchema], default: [] },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
