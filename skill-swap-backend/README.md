# SkillSwap Backend

Node.js + Express + MongoDB backend for the SkillSwap frontend.

## 1. Create a free MongoDB Atlas database

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and sign up (free, no credit card).
2. Create a new **free (M0) cluster**.
3. Under **Database Access**, create a database user (username + password).
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** on your cluster → **Drivers** → copy the connection string.
6. Replace `<username>` and `<password>` with your database user, and add `/skillswap` before the `?`:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
   ```

## 2. Configure the backend

```bash
cd skill-swap-backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — the connection string from step 1.6
- `JWT_SECRET` — any long random string
- `PORT` — leave as `5000`

## 3. Set up Gmail for real OTP emails

Registration sends a real OTP by email using your Gmail account. This needs an
**App Password** (NOT your normal Gmail password) since Gmail blocks plain
password logins from apps.

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security).
2. Turn on **2-Step Verification** if it isn't already on (required for App Passwords).
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Under "App name", type something like `SkillSwap` and click **Create**.
5. Google shows a 16-character password (e.g. `abcd efgh ijkl mnop`) — copy it (remove the spaces).
6. In your `.env` file:
   ```
   GMAIL_USER=youraddress@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

That's it — no other service or signup needed. OTP emails will come from your
own Gmail address.

## 4. Set up Google Gemini for the AI chatbot

The floating chat widget on the website is powered by Google's free Gemini API.

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Sign in with any Google account and click **Create API key** — it's free, no credit card needed.
3. Copy the key and paste it into `.env`:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```

That's it — the chatbot works immediately once this is set and the server is restarted.

## 5. Seed sample data (optional but recommended)

```bash
node seed.js
```

Creates 5 sample users (`john@example.com`, `sarah@example.com`, etc.), all with password `password123`.

## 6. Run the server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 SkillSwap backend running on http://localhost:5000
```

## API Reference

### Auth
| Method | Route | Body | Auth? |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, phone, gender }` | No |
| POST | `/api/auth/login` | `{ email, password }` | No |
| GET | `/api/auth/me` | — | Yes |

### OTP (email verification)
| Method | Route | Body | Auth? |
|---|---|---|---|
| POST | `/api/otp/send` | `{ email }` | No |
| POST | `/api/otp/verify` | `{ email, code }` | No |

### AI Chatbot
| Method | Route | Body | Auth? |
|---|---|---|---|
| POST | `/api/chat` | `{ message, history }` | No |

### Users
| Method | Route | Notes |
|---|---|---|
| GET | `/api/users?search=react&category=web-dev` | Both query params optional |
| GET | `/api/users/:id` | Single profile |
| PUT | `/api/users/me` | Update your own profile (auth required) |

### Swap Requests (all require auth)
| Method | Route | Body |
|---|---|---|
| POST | `/api/requests` | `{ toUser, offeredSkill, requestedSkill, message }` |
| GET | `/api/requests/sent` | — |
| GET | `/api/requests/received` | — |
| PATCH | `/api/requests/:id` | `{ status: "Accepted" \| "Rejected" \| "Completed" }` |
| PATCH | `/api/requests/:id/review` | `{ rating: 1-5, text }` |

### Conversations & Messages (all require auth)
| Method | Route | Body |
|---|---|---|
| GET | `/api/conversations` | — |
| POST | `/api/conversations` | `{ userId }` |
| GET | `/api/conversations/:id/messages` | — |
| POST | `/api/conversations/:id/messages` | `{ text }` |

**Authenticated requests** need this header:
```
Authorization: Bearer <token>
```
