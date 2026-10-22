// Run this once after connecting to MongoDB Atlas to populate sample users.
// Usage: node seed.js

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import connectDB from './config/db.js'
import User from './models/User.js'

const sampleUsers = [
  {
    name: 'John Carter',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Frontend engineer of 5 years. Looking to finally get comfortable with color theory and layout.',
    location: 'Austin, TX',
    teaching: [{ skill: 'React', category: 'web-dev', level: 'Expert' }],
    learning: [{ skill: 'Graphic Design', category: 'graphic-design' }],
    availability: 'Weekends',
    rating: 4.9,
    reviews: 31,
  },
  {
    name: 'Sarah Nguyen',
    email: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?img=47',
    bio: 'Product designer who has shipped 20+ mobile apps. Happy to teach Figma in exchange for learning to code.',
    location: 'Seattle, WA',
    teaching: [{ skill: 'UI/UX Design', category: 'ui-ux', level: 'Expert' }],
    learning: [{ skill: 'Python', category: 'programming' }],
    availability: 'Weekday evenings',
    rating: 5.0,
    reviews: 44,
  },
  {
    name: 'Alex Kim',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=33',
    bio: 'Backend-leaning Python developer. Want to get better at photography for a travel blog.',
    location: 'Toronto, ON',
    teaching: [{ skill: 'Python', category: 'programming', level: 'Advanced' }],
    learning: [{ skill: 'Photography', category: 'photography' }],
    availability: 'Flexible',
    rating: 4.6,
    reviews: 18,
  },
  {
    name: 'David Ochoa',
    email: 'david@example.com',
    avatar: 'https://i.pravatar.cc/150?img=53',
    bio: 'Freelance video editor for 8 years. Trying to pick up marketing to grow my own channel.',
    location: 'Mexico City, MX',
    teaching: [{ skill: 'Video Editing', category: 'video-editing', level: 'Expert' }],
    learning: [{ skill: 'Marketing', category: 'marketing' }],
    availability: 'Weekends',
    rating: 4.8,
    reviews: 27,
  },
  {
    name: 'Emma Rossi',
    email: 'emma@example.com',
    avatar: 'https://i.pravatar.cc/150?img=25',
    bio: 'Graphic designer specializing in brand identity. Want to learn conversational Spanish.',
    location: 'Milan, IT',
    teaching: [{ skill: 'Graphic Design', category: 'graphic-design', level: 'Advanced' }],
    learning: [{ skill: 'Spanish', category: 'languages' }],
    availability: 'Weekday mornings',
    rating: 4.9,
    reviews: 22,
  },
]

async function seed() {
  await connectDB()

  console.log('Clearing existing users...')
  await User.deleteMany({})

  console.log('Creating sample users (default password: password123)...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  for (const u of sampleUsers) {
    await User.create({ ...u, password: hashedPassword })
  }

  console.log(`✅ Seeded ${sampleUsers.length} users.`)
  console.log('   Login with any of their emails above + password: password123')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
