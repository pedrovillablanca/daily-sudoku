import { Grid, PuzzleData, Difficulty } from "./types";
import { mulberry32, dateToSeed } from "./prng";
import { solve, isValid, countSolutions } from "./solver";

const DIFFICULTY_CELLS_TO_REMOVE: Record<Difficulty, [number, number]> = {
  easy: [30, 40],
  medium: [40, 50],
  hard: [50, 55],
  expert: [55, 60],
};

function createEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function fillGrid(grid: Grid, rng: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
        for (const num of numbers) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid, rng)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function removeNumbers(
  grid: Grid,
  difficulty: Difficulty,
  rng: () => number
): Grid {
  const puzzle = grid.map((row) => [...row]);
  const [minRemove, maxRemove] = DIFFICULTY_CELLS_TO_REMOVE[difficulty];
  const cellsToRemove =
    minRemove + Math.floor(rng() * (maxRemove - minRemove + 1));

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  const shuffled = shuffleArray(positions, rng);
  let removed = 0;

  for (const [r, c] of shuffled) {
    if (removed >= cellsToRemove) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    const testGrid = puzzle.map((row) => [...row]);
    if (countSolutions(testGrid) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup;
    }
  }

  return puzzle;
}

export function generateDailyPuzzle(
  date: Date,
  difficulty: Difficulty
): PuzzleData {
  const seed = dateToSeed(date);
  const rng = mulberry32(seed + difficulty.charCodeAt(0));

  const solution = createEmptyGrid();
  fillGrid(solution, rng);

  const puzzle = removeNumbers(solution, difficulty, rng);

  return {
    puzzle,
    solution,
    seed,
    difficulty,
  };
}

export function getEmptyGrid(): Grid {
  return createEmptyGrid();
}
