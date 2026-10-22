// Uses Google Gemini's free API to power a chatbot that knows about
// SkillSwap and can answer questions about how the platform works.
// Get a free API key at https://aistudio.google.com/app/apikey — no
// billing or credit card required for the free tier.

const SYSTEM_CONTEXT = `You are the friendly AI assistant for SkillSwap, a platform where people
trade skills instead of paying money — someone who knows React can teach it in exchange for
learning graphic design, for example. Key things to know about SkillSwap:
- No money changes hands, ever. Every exchange is skill-for-skill.
- Users list skills they can teach and skills they want to learn.
- The Explore page lets people search and filter by category (Programming, Web Development,
  UI/UX Design, Graphic Design, Photography, Video Editing, Languages, Marketing).
- To start a swap: browse Explore, click "Request Swap" on someone's card, pick what you'll
  offer and what you want to learn, and send a message.
- The other person can Accept or Reject the request from the Swap Requests page.
- Once accepted, both people can chat and even start a video call from the Messages page.
- After finishing a swap, either person can mark it "Complete" and leave a star rating + review.
Answer questions about SkillSwap clearly and warmly, in 2-4 sentences. If asked something
unrelated to SkillSwap or skill-learning in general, gently steer the conversation back.`

export async function chatWithAI(req, res) {
  try {
    const { message, history = [] } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'A message is required.' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ message: 'AI chatbot is not configured on the server yet.' })
    }

    // Keep only the last few turns — long, growing history slows requests
    // down and makes the free tier's rate limit easier to hit.
    const recentHistory = history.slice(-8)

    // Gemini expects alternating user/model turns; we prepend our system
    // context as the first user turn followed by a model acknowledgement.
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_CONTEXT }] },
      { role: 'model', parts: [{ text: 'Got it — I\'m ready to help people with SkillSwap!' }] },
      ...recentHistory.map((h) => ({ role: h.from === 'me' ? 'user' : 'model', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const callGemini = () =>
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      })

    let response = await callGemini()

    // The free tier occasionally returns a transient 429/503 — retry once
    // after a short pause before giving up.
    if (response.status === 429 || response.status === 503) {
      await new Promise((r) => setTimeout(r, 1500))
      response = await callGemini()
    }

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ message: "I'm getting a lot of questions right now — please try again in a moment." })
      }
      throw new Error(data.error?.message || 'Gemini API request failed.')
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't come up with a reply."

    res.json({ reply })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get AI response.', error: err.message })
  }
}
