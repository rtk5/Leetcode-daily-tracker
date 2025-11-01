# 🏆 LeetCode Daily Streak Tracker

A collaborative web application to track and compare LeetCode problem-solving progress among friends. Stay motivated, maintain your coding streak, and compete on the leaderboard!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Core Functionalities](#-core-functionalities)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Automated Data Refresh](#-automated-data-refresh)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Features
- **Real-time LeetCode Data Sync** - Fetches problem-solving statistics directly from LeetCode's GraphQL API
- **Daily Streak Tracking** - Automatically calculates and maintains current and longest streaks
- **Friend Leaderboard** - Compare your progress with friends in a competitive leaderboard
- **Group Statistics** - View aggregated stats across all users
- **User Profiles** - Individual user cards with avatars, stats, and progress indicators
- **IST Timezone Support** - All dates and times are handled in Indian Standard Time
- **Automated Daily Refresh** - GitHub Actions automatically updates data every day

### 📊 Tracking Metrics
- Total problems solved
- Easy, Medium, and Hard problem counts
- Current streak (consecutive days solving problems)
- Longest streak achieved
- Daily problem-solving count
- Historical progress tracking

### 📸 Daily Accountability
- **Automated Screenshot Capture** - Takes full-page screenshots daily at 12:05 AM IST
- **Email Notifications** - Sends screenshots to all group members
- **Friendly Reminders** - Motivational messages about maintaining streaks
- **Screenshot Archive** - Stores 30 days of historical screenshots

## 🎬 Demo

**Live Demo:** [[click here!](https://leetcode-grinder.netlify.app/)]

**Test the app:**
1. Add your LeetCode username
2. View your stats and streak
3. Compete with friends on the leaderboard

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Edge Functions (Deno runtime)
  - Real-time subscriptions
  - Authentication ready

### DevOps
- **GitHub Actions** - Automated daily data refresh
- **Netlify** - Frontend hosting and deployment
- **Git** - Version control

### Automation & Monitoring
- **Playwright** - Automated browser screenshots
- **Gmail SMTP** - Email notification system
- **Cron Jobs** - Scheduled workflows

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Netlify)
│   (TypeScript)  │
└────────┬────────┘
         │
         │ HTTP Requests
         │
         ▼
┌─────────────────────────────┐
│   Supabase Backend          │
├─────────────────────────────┤
│  Edge Functions:            │
│  - fetch-leetcode-data      │
│  - refresh-all-users        │
├─────────────────────────────┤
│  PostgreSQL Database:       │
│  - users                    │
│  - daily_stats              │
│  - fetch_log                │
└────────┬────────────────────┘
         │
         │ GraphQL
         │
         ▼
┌─────────────────┐
│  LeetCode API   │
│   (GraphQL)     │
└─────────────────┘

┌──────────────────────────────┐
│   GitHub Actions (Cron)      │
├──────────────────────────────┤
│  1. refresh-leetcode.yml     │
│     - Runs at 12:00 AM IST   │
│     - Updates all user data  │
│                              │
│  2. screenshot.yml           │
│     - Runs at 12:05 AM IST   │
│     - Captures website       │
│     - Emails all members     │
└──────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- LeetCode account for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/leetcode-daily-tracker.git
   cd leetcode-daily-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   Create a new Supabase project at [supabase.com](https://supabase.com)
   
   Run the migration:
   ```bash
   # Execute the SQL in: supabase/migrations/20251014061458_create_leetcode_tracker_schema.sql
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy Supabase Functions**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Deploy functions
   supabase functions deploy fetch-leetcode-data
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
leetcode-daily-tracker/
├── .github/
│   └── workflows/
│       └── refresh-leetcode.yml    # Daily automated refresh
├── src/
│   ├── components/
│   │   ├── AddUserModal.tsx        # Modal to add new users
│   │   ├── GroupStats.tsx          # Aggregate group statistics
│   │   ├── Leaderboard.tsx         # Ranked leaderboard component
│   │   └── UserCard.tsx            # Individual user display card
│   ├── lib/
│   │   └── supabase.ts             # Supabase client configuration
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles (Tailwind)
├── supabase/
│   ├── functions/
│   │   └── fetch-leetcode-data/
│   │       └── index.ts            # Edge function for data fetching
│   └── migrations/
│       └── 20251014061458_create_leetcode_tracker_schema.sql
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔧 Core Functionalities

### 1. **Adding Users** 
**Component:** `AddUserModal.tsx`

- Input LeetCode username
- Validates user exists on LeetCode
- Fetches initial statistics
- Creates user profile in database
- Initializes streak counters

**User Flow:**
```
Click "Add User" → Enter Username → Validate → Fetch Data → Save to DB → Display Card
```

### 2. **Fetching LeetCode Data**
**Edge Function:** `fetch-leetcode-data/index.ts`

**Process:**
1. Receives username via query parameter
2. Queries LeetCode's GraphQL API
3. Extracts problem-solving statistics
4. Updates or creates user record
5. Calculates streaks based on daily activity
6. Stores daily snapshot in `daily_stats`
7. Logs fetch operation

**API Call:**
```typescript
GET /functions/v1/fetch-leetcode-data?username=leetcode_username
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "user123",
    "totalSolved": 250,
    "easySolved": 120,
    "mediumSolved": 100,
    "hardSolved": 30,
    "avatar": "https://..."
  }
}
```

### 3. **Streak Calculation**
**Function:** `calculateStreak()` in `fetch-leetcode-data/index.ts`

**Algorithm:**
- Checks if user solved problems today (newTotal > oldTotal)
- If yes, increments streak by 1
- Looks back through `daily_stats` to find consecutive days
- Breaks streak if any day is missing or has 0 problems
- Updates longest streak if current streak exceeds it

**Example:**
```
Day 1: Solved 2 problems → Streak = 1
Day 2: Solved 1 problem  → Streak = 2
Day 3: Solved 0 problems → Streak = 0 (broken)
Day 4: Solved 3 problems → Streak = 1 (restart)
```

### 4. **User Profile Display**
**Component:** `UserCard.tsx`

Displays:
- LeetCode avatar
- Username and display name
- Total problems solved
- Easy/Medium/Hard breakdown
- Current streak with fire emoji 🔥
- Longest streak record
- Refresh button for manual update

### 5. **Leaderboard Ranking**
**Component:** `Leaderboard.tsx`

**Ranking Criteria:**
1. Total problems solved (primary)
2. Current streak (secondary tiebreaker)
3. Alphabetical by username (tertiary)

Features:
- Position numbers (1st, 2nd, 3rd...)
- Trophy icons for top 3 🥇🥈🥉
- Visual stats bars
- Responsive grid layout

### 6. **Group Statistics**
**Component:** `GroupStats.tsx`

**Aggregated Metrics:**
- Total problems solved by all users
- Average problems per user
- Total active users
- Highest current streak in group
- Most consistent solver

### 7. **Daily Data Tracking**
**Table:** `daily_stats`

Records daily snapshots:
- Date (IST timezone)
- User ID
- Problems solved that day
- Total problems snapshot
- Allows historical analysis and streak validation

### 8. **IST Timezone Handling**

**Helper Functions:**
```typescript
getISTDate()      // Returns current date in IST (YYYY-MM-DD)
getISTTimestamp() // Returns current timestamp in IST
getISTYesterday() // Returns yesterday's date in IST
```

All date operations account for IST (UTC+5:30) to ensure:
- Correct daily boundaries for Indian users
- Accurate streak calculations
- Consistent date comparisons

## 🗄️ Database Schema

### **users** table
```sql
- id (uuid, primary key)
- leetcode_username (text, unique)
- display_name (text)
- total_solved (integer)
- easy_solved (integer)
- medium_solved (integer)
- hard_solved (integer)
- current_streak (integer)
- longest_streak (integer)
- avatar_url (text)
- created_at (timestamp)
- last_fetched_at (timestamp)
```

### **daily_stats** table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- date (date)
- problems_solved (integer) -- problems solved on this specific day
- total_solved_snapshot (integer) -- total count at end of day
- created_at (timestamp)

UNIQUE (user_id, date)
```

### **fetch_log** table
```sql
- id (uuid, primary key)
- user_id (uuid, nullable)
- fetch_time (timestamp)
- success (boolean)
- error_message (text, nullable)
```

## 📡 API Documentation

### Fetch User Data

**Endpoint:** `GET /functions/v1/fetch-leetcode-data`

**Query Parameters:**
- `username` (required): LeetCode username

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "string",
    "totalSolved": "number",
    "easySolved": "number",
    "mediumSolved": "number",
    "hardSolved": "number",
    "avatar": "string"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch LeetCode data"
}
```

### LeetCode GraphQL Query

The application uses this GraphQL query:

```graphql
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      userAvatar
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
```

## 🤖 Automated Data Refresh

### GitHub Actions Workflow

**File:** `.github/workflows/refresh-leetcode.yml`

**Schedule:** Daily at 12:00 AM IST (6:30 PM UTC)

**Process:**
1. Fetches all users from Supabase
2. Calls `fetch-leetcode-data` for each user
3. Waits 2 seconds between requests (rate limiting)
4. Logs success/failure for each user

**Manual Trigger:**
- Go to GitHub Actions tab
- Select "Refresh LeetCode Data Daily"
- Click "Run workflow"

**Setup Requirements:**

GitHub Secrets needed:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 🚢 Deployment

### Frontend (Netlify)

1. **Connect GitHub Repository**
   - Log in to Netlify
   - Click "New site from Git"
   - Select your repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   Add in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Netlify auto-deploys on push to main branch

### Backend (Supabase)

1. **Create Supabase Project**
   - Sign up at supabase.com
   - Create new project

2. **Run Migrations**
   - Execute SQL from `supabase/migrations/`

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy fetch-leetcode-data
   ```

4. **Configure Secrets**
   ```bash
   supabase secrets set SUPABASE_URL=your_url
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Write type-safe TypeScript code
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update README if adding new features

## 🐛 Known Issues & Limitations

- LeetCode API rate limiting (2 second delay between requests)
- No authentication system (all users can see all data)
- Manual refresh required if GitHub Actions fails
- IST timezone only (not configurable)
- No mobile app (web only)

## 🔮 Future Enhancements

- [ ] User authentication and private groups
- [ ] Email/Discord notifications for streak breaks
- [ ] Weekly/monthly progress reports
- [ ] Problem difficulty analysis
- [ ] Head-to-head comparison view
- [ ] Achievement badges and rewards
- [ ] Dark/light theme toggle
- [ ] Export stats to CSV
- [ ] Integration with other coding platforms (Codeforces, CodeChef)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LeetCode](https://leetcode.com) for the GraphQL API
- [Supabase](https://supabase.com) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide](https://lucide.dev) for icons


---

⭐ If you find this project helpful, please give it a star!

🐛 Found a bug? [Open an issue](https://github.com/yourusername/leetcode-daily-tracker/issues)

💡 Have a feature idea? [Start a discussion](https://github.com/yourusername/leetcode-daily-tracker/discussions)
