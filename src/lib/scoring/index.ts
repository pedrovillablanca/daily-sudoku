import { Difficulty } from "../engine/types";

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.2,
  hard: 1.5,
  expert: 2.0,
};

const BASE_POINTS_PER_NUMBER = 100;
const STREAK_BONUS_INCREMENT = 10;
const MAX_STREAK_BONUS = 50;
const WRONG_NUMBER_PENALTY = 25;
const TIME_DECAY_INTERVAL = 30;
const TIME_DECAY_AMOUNT = 5;
const MIN_POINTS_PER_NUMBER = 50;

export function getPointsPerNumber(
  elapsedSeconds: number,
  difficulty: Difficulty
): number {
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const decaySteps = Math.floor(elapsedSeconds / TIME_DECAY_INTERVAL);
  const decayed = Math.max(
    MIN_POINTS_PER_NUMBER,
    BASE_POINTS_PER_NUMBER - decaySteps * TIME_DECAY_AMOUNT
  );
  return Math.round(decayed * multiplier);
}

export function getStreakBonus(streak: number): number {
  return Math.min(streak * STREAK_BONUS_INCREMENT, MAX_STREAK_BONUS);
}

export function calculateNumberPoints(
  elapsedSeconds: number,
  difficulty: Difficulty,
  streak: number
): number {
  const base = getPointsPerNumber(elapsedSeconds, difficulty);
  const streakBonus = getStreakBonus(streak);
  return base + streakBonus;
}

export function calculateWrongPenalty(): number {
  return -WRONG_NUMBER_PENALTY;
}

export function getDifficultyMultiplier(difficulty: Difficulty): number {
  return DIFFICULTY_MULTIPLIER[difficulty];
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}
