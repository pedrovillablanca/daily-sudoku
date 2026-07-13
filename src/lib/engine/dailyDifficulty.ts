import { Difficulty } from "./types";

const DIFFICULTY_ROTATION: Difficulty[] = [
  "easy",    // Sunday (0)
  "easy",    // Monday (1)
  "medium",  // Tuesday (2)
  "medium",  // Wednesday (3)
  "hard",    // Thursday (4)
  "hard",    // Friday (5)
  "expert",  // Saturday (6)
];

export function getDailyDifficulty(date: Date = new Date()): Difficulty {
  return DIFFICULTY_ROTATION[date.getDay()];
}

export function getDifficultyLabel(d: Difficulty): string {
  const labels: Record<Difficulty, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    expert: "Expert",
  };
  return labels[d];
}
