# Online 10-Question Timed Test System

A complete, production-ready, full-stack assessment platform featuring a public candidate testing portal with a strict **5-second per question countdown** and automatic question transition, alongside a secure **JWT-authenticated Admin Results Dashboard** with real-time analytics, filtering, question-by-question candidate response auditing, and CSV export.

---

## 🌟 Key Features

### 🎯 Candidate Experience (`/test`)
- **Zero Registration Hassle**: Candidates enter basic details (Full Name, Email, College/Organization, Phone) and begin immediately.
- **Strict 5-Second Timer Per Question**: Large, obvious visual countdown timer (5, 4, 3, 2, 1) with color-shifting visual feedback (Emerald → Amber → Rose).
- **Automatic Instant Progression**:
  - Selecting an answer immediately stops the timer, records the choice, displays subtle visual feedback (250ms), and auto-advances to the next question.
  - If the timer hits zero, the question is recorded as unanswered/skipped and auto-advances.
  - No manual "Next" button clicking needed.
- **Anti-Abuse & Integrity Controls**:
  - Previous question navigation disabled.
  - Double-click and duplicate submissions prevented via state and ref locks.
  - Correct answers are **never leaked** in the public question payload (`correctAnswer` is stripped server-side).
- **Session Interruption & Refresh Recovery**:
  - If a candidate refreshes during an assessment, the system restores the current attempt and resumes at the next unanswered question without generating duplicate attempts or losing previous answers.
- **Performance Evaluation Screen (`/test/result`)**:
  - Displays Candidate Name, Final Score (e.g. 7 / 10), Percentage, Correct, Wrong, and Unanswered counts.
  - Performance tier feedback: Excellent (80–100%), Good (60–79%), Needs Improvement (40–59%), Keep Practicing (<40%).

### 🛡️ Admin Dashboard (`/admin/dashboard`)
- **Secure Authentication**: JWT-secured login (`/admin/login`) with bcrypt-hashed passwords.
- **Cohort Analytics & KPI Cards**:
  - Total Candidates
  - Tests Completed
  - Cohort Average Score
  - Highest Score
  - Lowest Score
- **Interactive Score Distribution Chart**: Recharts histogram breaking down candidate performance into percentage quintiles (0–20%, 21–40%, 41–60%, 61–80%, 81–100%).
- **Advanced Results Table**:
  - Real-time search across candidate Name, Email, and College.
  - Filter by status (`ALL`, `COMPLETED`, `INCOMPLETE`) and score tiers (`71–100%`, `41–70%`, `0–40%`).
  - Sort by latest/oldest attempt date and highest/lowest score.
- **Detailed Candidate Audit Modal**:
  - View individual candidate metadata, test start time, completion time, and duration.
  - Complete question-by-question breakdown showing: Question text, Candidate selected answer, Correct answer, Result status badge (Correct, Wrong, Unanswered), and elapsed response time (e.g. 3.2s).
- **Cascade Deletion**: Safely delete test attempts with a confirmation modal; associated question answers are cascade-deleted in SQLite.
- **1-Click CSV Export**: Download complete candidate assessment data directly as a `.csv` spreadsheet.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Fast single-page application bundling |
| **Styling** | Tailwind CSS 3 | Modern responsive UI with customized color palettes |
| **Routing** | React Router v6 | Client-side routing with protected route guards |
| **Charts** | Recharts | Responsive score distribution bar charts |
| **Icons** | Lucide React | Clean, modern feather-style iconography |
| **HTTP Client**| Axios | Interceptors with automatic JWT injection & error handling |
| **Backend** | Node.js + Express | RESTful API server with modular controllers & routers |
| **Database** | SQLite + Prisma ORM | Embedded zero-configuration SQL database with schema typing |
| **Auth** | JWT + bcryptjs | Token-based admin authentication & password hashing |

---

## 📁 Project Structure

```text
timed-test-system/
├── package.json              # Root coordination scripts
├── .env.example              # Sample configuration
├── README.md                 # Project documentation
│
├── server/                   # Express + Prisma Backend
│   ├── package.json
│   ├── .env                  # Server environment variables
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma     # Database models (Admin, Question, TestAttempt, Answer)
│   │   ├── seed.js           # Idempotent admin & 10 questions seeder
│   │   └── dev.db            # SQLite database file
│   └── src/
│       ├── controllers/
│       │   ├── testController.js   # Public candidate endpoints
│       │   └── adminController.js  # Protected admin endpoints
│       ├── middleware/
│       │   └── auth.js             # JWT bearer verification middleware
│       ├── routes/
│       │   ├── testRoutes.js
│       │   └── adminRoutes.js
│       ├── prisma.js               # Prisma client singleton
│       └── server.js               # Express application entrypoint
│
└── client/                   # React + Vite Frontend
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env                  # Client API URL configuration
    ├── .env.example
    └── src/
        ├── components/
        │   ├── Navbar.jsx               # Navigation bar
        │   ├── ProtectedRoute.jsx       # Route guard for admin
        │   ├── CandidateDetailModal.jsx # Question-by-question breakdown modal
        │   └── ConfirmDialog.jsx        # Deletion confirmation modal
        ├── context/
        │   └── AuthContext.jsx          # Admin authentication state provider
        ├── pages/
        │   ├── CandidateStart.jsx       # Landing screen & candidate registration
        │   ├── CandidateTest.jsx        # 5-second per question test screen
        │   ├── CandidateResult.jsx      # Result celebration & score report
        │   ├── AdminLogin.jsx           # Admin login with quick demo filler
        │   └── AdminDashboard.jsx       # Analytics, results table, view & export
        ├── services/
        │   └── api.js                   # Axios client instance & endpoints
        ├── App.jsx                      # App router configuration
        ├── main.jsx                     # React entrypoint
        └── index.css                    # Tailwind CSS directives
```

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- **Node.js** (v18 or newer recommended, v22 tested)
- **npm** (v9 or newer)

---

### 2. Backend Setup & Database Migration

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Ensure `server/.env` is configured (defaults are pre-configured):
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="timed-test-jwt-super-secret-key-2026-production"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="AdminPassword123!"
   CLIENT_URL="http://localhost:5173"
   ```

4. Push the Prisma schema to create the SQLite database:
   ```bash
   npx prisma db push
   ```

5. Seed the initial admin user and the 10 technical questions:
   ```bash
   node prisma/seed.js
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   # Server will run at: http://localhost:5000
   ```

---

### 3. Frontend Setup

1. Open a second terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Ensure `client/.env` contains the backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   # Vite will start at: http://localhost:5173
   ```

---

## 🔑 Default Admin Credentials

| Credential | Value |
| :--- | :--- |
| **Email** | `admin@example.com` |
| **Password** | `AdminPassword123!` |
| **Admin Login URL** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) |
| **Admin Dashboard** | [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard) |

> 💡 **Tip**: On the `/admin/login` page, click the **"Fill Seeded Admin Credentials"** button to automatically populate these credentials.

---

## 🌐 Public Candidate Test URL

- **URL**: [http://localhost:5173/test](http://localhost:5173/test)
- Candidates can open this URL directly from any desktop, tablet, or mobile device without logging in.

---

## 🧪 Testing the Complete End-to-End Workflow

### Candidate Flow
1. Open `http://localhost:5173/test`.
2. Enter your Name, Email, and Organization.
3. Click **"Start Test Now"**.
4. Question 1 displays with a 5-second countdown.
5. Click an option: notice the instant answer highlight, timer stop, and immediate smooth progression to Question 2.
6. On one of the questions, let the 5-second timer expire without clicking: notice the question is auto-skipped and advances to the next question.
7. Upon completing Question 10, the test automatically finalizes on the server.
8. The Result Screen displays the score, percentage, correct/wrong/unanswered counts, and performance badge.

### Admin Flow
1. Open `http://localhost:5173/admin/login`.
2. Click **"Fill Seeded Admin Credentials"** and click **"Sign In"**.
3. The Admin Dashboard opens, displaying:
   - Summary cards updating with the candidate's submission.
   - Score distribution bar chart.
   - Candidate result row in the results table.
4. Test **Search** by candidate name or college.
5. Test **Filters** (Status, Score tier) and **Sorting**.
6. Click **"View"**: inspect the question-by-question breakdown showing candidate answers, correct answers, status badge, and time taken (e.g. `2.4s`).
7. Click **"Export CSV"**: a `candidate_test_results.csv` file will download to your machine.
8. Click the trash icon on a row: a confirmation modal asks for verification before performing a cascade deletion.

---

## 🏗️ Production Build

To build the frontend for production deployment:
```bash
cd client
npm run build
```
The optimized, minified production assets will be generated in `client/dist`.

To run the backend in production mode:
```bash
cd server
npm start
```