export type Grid = number[][];
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface PuzzleData {
  puzzle: Grid;
  solution: Grid;
  seed: number;
  difficulty: Difficulty;
}

export interface GameState {
  puzzle: Grid;
  solution: Grid;
  currentGrid: Grid;
  selectedCell: [number, number] | null;
  errors: Set<string>;
  difficulty: Difficulty;
  isComplete: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedTime: number;
}
