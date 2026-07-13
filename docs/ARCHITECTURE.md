# Architecture & Technical Design

## 1. System Diagram
```mermaid
graph TD
    A[Client Browser] -->|Loads Game| B[Next.js Server]
    B -->|Generates puzzle from date seed| A
    A -->|Checks if already played| C[/api/check-played]
    C -->|Queries by fingerprint + IP| D[Prisma / Database]
    A -->|Submits Score + IP| E[/api/score]
    E -->|Validates & Saves| D
    E -->|Returns rank| A
    A -->|Fetches rankings| F[/api/leaderboard]
    F -->|Returns top scores| A
```

## 2. Data Models (Prisma Schema)

```prisma
model User {
  id          String   @id @default(cuid())
  alias       String   @unique
  fingerprint String   @unique
  createdAt   DateTime @default(now())
  scores      Score[]
}

model Score {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  score       Int
  timeSeconds Int
  difficulty  String
  errors      Int
  hintsUsed   Int      @default(0)
  completed   Boolean  @default(true)
  ipAddress   String   @default("")
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, date])
  @@index([date, score])
  @@index([ipAddress, date])
}
```

## 3. Daily Difficulty Rotation
Difficulty is determined automatically by the day of week:
- **Sunday/Monday:** Easy (30-40 cells removed)
- **Tuesday/Wednesday:** Medium (40-50 cells removed)
- **Thursday/Friday:** Hard (50-55 cells removed)
- **Saturday:** Expert (55-60 cells removed)

No user selection. The `getDailyDifficulty()` function returns the correct difficulty for any given date.

## 4. Puzzle Generation Logic (The "Engine")
The Sudoku engine must be deterministic.
1.  **Input:** Date String (e.g., "2024-05-21").
2.  **Process:**
    - Convert Date String to an Integer Seed.
    - Use a seeded PRNG (mulberry32).
    - Generate a full valid Sudoku board.
    - Apply difficulty logic to remove numbers based on daily rotation.
3.  **Output:** A 9x9 array (0 for empty cells).

## 5. Anti-Play-Once-Per-Day System
Three layers of protection:

### Layer 1: Browser Fingerprint
- Canvas fingerprint generated on client
- Hashed with SHA-256
- Stored in `User.fingerprint`
- Checked before game starts and on score submission

### Layer 2: IP Address Tracking
- Client IP extracted from `x-forwarded-for` or `x-real-ip` headers
- Stored in `Score.ipAddress`
- `@@index([ipAddress, date])` for fast lookups
- Same IP cannot submit more than one score per day

### Layer 3: LocalStorage Flag
- After game completes, `daily-sudoku-played-{YYYY-MM-DD}` set in localStorage
- Checked on page load for instant blocked screen

## 6. API Endpoints

### `GET /api/check-played`
Checks if a user has already played today.
- **Params:** `fingerprint`, `date`
- **Returns:** `{ played: boolean, reason?: "fingerprint" | "ip" }`

### `POST /api/score`
Submits a completed game score.
- **Body:** `{ alias, fingerprint, timeSeconds, errors, hintsUsed }`
- **Server:** Auto-adds difficulty (from day) and IP address
- **Returns:** `{ rank, score, alias }`
- **Errors:** 409 if already played (fingerprint or IP)

### `GET /api/leaderboard`
Returns today's rankings.
- **Params:** `date`, `limit`
- **Returns:** Array of `{ rank, alias, score, timeSeconds, errors, difficulty }`

## 7. Security & Anti-Cheat
- **IP Extraction:** Uses `x-forwarded-for` (first IP) with fallback to `x-real-ip`.
- **Input Validation:** All scores validated server-side.
- **Difficulty Override:** Client cannot choose difficulty; server determines it from date.
- **Sanitization:** Aliases trimmed and length-capped at 20 chars.
