# Daily Sudoku Challenge - Development Guidelines

This document serves as the **Single Source of Truth** for the project. All development, code reviews, and AI generations must adhere to these standards to ensure consistency, performance, and quality.

## 1. Project Overview
- **Name:** Daily Sudoku Challenge
- **Goal:** A minimalist, high-performance daily Sudoku game with a global leaderboard.
- **Core Logic:** Like Wordle, a new puzzle is released every day at midnight (UTC). Users get **one attempt per day per IP**.
- **Difficulty:** Automatically assigned based on day of week. No user selection.
- **Environment:** Frontend-heavy with a serverless backend for data persistence and global rankings.

## 2. Daily Difficulty Rotation
The difficulty rotates automatically by day of week:
| Day         | Difficulty |
|-------------|------------|
| Sunday (0)  | Easy       |
| Monday (1)  | Easy       |
| Tuesday (2) | Medium     |
| Wednesday (3)| Medium    |
| Thursday (4)| Hard       |
| Friday (5)  | Hard       |
| Saturday (6)| Expert     |

**No difficulty picker is shown to the user.** The game starts immediately with the daily difficulty.

## 3. Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (Minimalist, clean, high contrast)
- **Animations:** Framer Motion (Smooth cell selection, number entry, and success/failure states)
- **State Management:** Zustand (For game state, lightweight and performant)
- **Backend/Database:**
  - **ORM:** Prisma
  - **Database:** SQLite (for local/dev) -> PostgreSQL (for production/Supabase)
  - **API:** Next.js Server Actions or Route Handlers

## 4. Daily Rotation & Seeding Logic
To ensure every player gets the same puzzle on the same day:
- The puzzle is generated based on a **Deterministic Seed** derived from the current date (`YYYY-MM-DD`).
- **Anti-Cheat & Restrictions:**
  - **Browser Fingerprinting:** Canvas fingerprint hashed and stored in DB.
  - **IP Tracking:** IP address stored per score entry. Same IP cannot play twice same day.
  - **Local Storage:** Flag stored per date to prevent reloads on same device.
  - **Database:** Unique constraint on `(userId, date)` prevents duplicate submissions.

## 5. Scoring System
The score is calculated based on a weighted formula that rewards speed and accuracy.

### Formula
`FinalScore = (BasePoints - TimePenalty - ErrorPenalty) * DifficultyMultiplier`

1.  **BasePoints:** 1000
2.  **TimePenalty:** `TotalSecondsElapsed / 2` (Max penalty capped at 900)
3.  **ErrorPenalty:** `ErrorsCount * 50`
4.  **DifficultyMultiplier:**
    - Easy: 1.0x
    - Medium: 1.2x
    - Hard: 1.5x
    - Expert: 2.0x

*Note: Score cannot drop below 1 point. If the calculation is negative, return 1.*

## 6. UI/UX Design Principles
- **Minimalism:** Focus on the board. No clutter.
- **No Difficulty Picker:** Game auto-starts with the day's difficulty.
- **Blocked Screen:** If user already played, show a locked screen with option to view leaderboard.
- **Color Palette:**
  - Background: Off-white/Light Gray (`#F8F9FA`)
  - Board: White with subtle grid lines.
  - Accents: Deep Blue (`#0D6EFD`) for selection, Red (`#DC3545`) for errors.
- **Animations:**
  - Cell selection should have a soft scale-up effect.
  - Number entry should be instant (no lag).
  - Victory screen should have confetti or a smooth "unfolding" animation.
  - Keyboard input must feel tactile (subtle button press animations).

## 7. Leaderboard Requirements
- **Global Ranking:** Players see their rank relative to all other players for that specific day.
- **Granularity:** Rank by Score (Descending), then by Time (Ascending) as a tie-breaker.
- **Privacy:** Only the user's chosen "Alias" or "Handle" is displayed publicly, not their email or IP.

## 8. Folder Structure
```
/src
  /app
    /api
      /score          -> POST: submit score (with IP check)
      /check-played   -> GET: check if user/IP already played today
      /leaderboard    -> GET: daily rankings
    /leaderboard      -> Global ranking page
  /components
    /board            -> Sudoku Grid and Cell components
    /keyboard         -> On-screen keyboard
    /ui               -> Buttons, Modals, Timer, NavBar
    /GameBoard.tsx    -> Main game orchestrator
    /Leaderboard.tsx  -> Leaderboard display
    /ScoreSubmitter.tsx -> Score submission form
  /lib
    /engine
      /prng.ts            -> Seeded PRNG (mulberry32)
      /generator.ts       -> Sudoku generator
      /solver.ts          -> Sudoku solver/validator
      /types.ts           -> TypeScript types
      /dailyDifficulty.ts -> Day-of-week difficulty rotation
    /scoring          -> Scoring calculation functions
    /store            -> Zustand store configuration
    /prisma.ts        -> Prisma client singleton
```

## 9. Coding Standards
- **TypeScript:** Strict mode enabled. No `any` types.
- **Formatting:** Prettier with default settings.
- **Linting:** ESLint with Next.js recommended config.
- **Performance:** Sudoku logic must run in Web Workers if calculations take > 16ms to prevent UI jank.
