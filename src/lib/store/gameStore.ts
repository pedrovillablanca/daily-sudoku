import { create } from "zustand";
import { Grid, Difficulty, PuzzleData } from "@/lib/engine/types";
import { generateDailyPuzzle } from "@/lib/engine/generator";
import { calculateNumberPoints, calculateWrongPenalty } from "@/lib/scoring";
import { getDailyDifficulty } from "@/lib/engine/dailyDifficulty";

interface ScorePopup {
  id: number;
  points: number;
  row: number;
  col: number;
  isCorrect: boolean;
}

interface GameStore {
  puzzle: Grid;
  solution: Grid;
  currentGrid: Grid;
  selectedCell: [number, number] | null;
  errors: Set<string>;
  totalErrors: number;
  difficulty: Difficulty;
  isComplete: boolean;
  startTime: number;
  elapsedTime: number;
  score: number;
  streak: number;
  hintsUsed: number;
  notesMode: boolean;
  notes: Record<string, number[]>;
  puzzleLoaded: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
  alreadyPlayed: boolean;
  blockedByIP: boolean;
  nickname: string;
  scorePopups: ScorePopup[];
  lastPopupId: number;

  setNickname: (name: string) => void;
  initGame: () => void;
  startGame: () => void;
  selectCell: (row: number, col: number) => void;
  enterNumber: (num: number) => void;
  eraseNumber: () => void;
  toggleNotesMode: () => void;
  addNote: (num: number) => void;
  useHint: () => void;
  tick: () => void;
  checkCompletion: () => void;
  setAlreadyPlayed: (played: boolean) => void;
  setBlockedByIP: (blocked: boolean) => void;
  removePopup: (id: number) => void;
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

export const useGameStore = create<GameStore>((set, get) => ({
  puzzle: [],
  solution: [],
  currentGrid: [],
  selectedCell: null,
  errors: new Set<string>(),
  totalErrors: 0,
  difficulty: "medium",
  isComplete: false,
  startTime: 0,
  elapsedTime: 0,
  score: 0,
  streak: 0,
  hintsUsed: 0,
  notesMode: false,
  notes: {},
  puzzleLoaded: false,
  gameStarted: false,
  gameFinished: false,
  alreadyPlayed: false,
  blockedByIP: false,
  nickname: "",
  scorePopups: [],
  lastPopupId: 0,

  setNickname: (name: string) => set({ nickname: name }),

  setAlreadyPlayed: (played: boolean) => set({ alreadyPlayed: played }),
  setBlockedByIP: (blocked: boolean) => set({ blockedByIP: blocked }),

  initGame: () => {
    const today = new Date();
    const difficulty = getDailyDifficulty(today);
    const data: PuzzleData = generateDailyPuzzle(today, difficulty);
    const savedNickname = "";
    set({
      puzzle: data.puzzle,
      solution: data.solution,
      currentGrid: data.puzzle.map((row) => [...row]),
      selectedCell: null,
      errors: new Set<string>(),
      totalErrors: 0,
      difficulty,
      isComplete: false,
      startTime: 0,
      elapsedTime: 0,
      score: 0,
      streak: 0,
      hintsUsed: 0,
      notesMode: false,
      notes: {},
      puzzleLoaded: true,
      gameStarted: false,
      gameFinished: false,
      nickname: savedNickname,
      scorePopups: [],
      lastPopupId: 0,
    });
  },

  startGame: () => {
    set({
      gameStarted: true,
      startTime: Date.now(),
    });
  },

  selectCell: (row: number, col: number) => {
    set({ selectedCell: [row, col] });
  },

  enterNumber: (num: number) => {
    const {
      selectedCell, currentGrid, puzzle, solution, errors,
      notesMode, notes, elapsedTime, difficulty, streak,
      score, lastPopupId, isComplete,
    } = get();
    if (!selectedCell || isComplete) return;

    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    if (notesMode) {
      const key = `${row}-${col}`;
      const currentNotes = notes[key] || [];
      const newNotes = currentNotes.includes(num)
        ? currentNotes.filter((n) => n !== num)
        : [...currentNotes, num];
      set({ notes: { ...notes, [key]: newNotes } });
      return;
    }

    const currentVal = currentGrid[row][col];
    if (currentVal === num) return;

    const newGrid = currentGrid.map((r) => [...r]);
    newGrid[row][col] = num;

    const newErrors = new Set(errors);
    const cellKey = `${row}-${col}`;
    const isCorrect = num === solution[row][col];

    if (!isCorrect) {
      newErrors.add(cellKey);
      const penalty = calculateWrongPenalty();
      const newPopupId = lastPopupId + 1;
      set({
        currentGrid: newGrid,
        errors: newErrors,
        totalErrors: get().totalErrors + 1,
        score: Math.max(0, score + penalty),
        streak: 0,
        scorePopups: [
          ...get().scorePopups,
          { id: newPopupId, points: penalty, row, col, isCorrect: false },
        ],
        lastPopupId: newPopupId,
      });
    } else {
      newErrors.delete(cellKey);
      const newNotes = { ...notes };
      delete newNotes[cellKey];

      const points = calculateNumberPoints(elapsedTime, difficulty, streak);
      const newStreak = streak + 1;
      const newPopupId = lastPopupId + 1;

      set({
        currentGrid: newGrid,
        errors: newErrors,
        notes: newNotes,
        score: score + points,
        streak: newStreak,
        scorePopups: [
          ...get().scorePopups,
          { id: newPopupId, points, row, col, isCorrect: true },
        ],
        lastPopupId: newPopupId,
      });
    }

    setTimeout(() => get().checkCompletion(), 0);
  },

  eraseNumber: () => {
    const { selectedCell, currentGrid, puzzle, isComplete } = get();
    if (!selectedCell || isComplete) return;

    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const newGrid = currentGrid.map((r) => [...r]);
    newGrid[row][col] = 0;
    set({ currentGrid: newGrid });
  },

  toggleNotesMode: () => {
    set((state) => ({ notesMode: !state.notesMode }));
  },

  addNote: (num: number) => {
    const { selectedCell, notes } = get();
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const key = `${row}-${col}`;
    const currentNotes = notes[key] || [];
    const newNotes = currentNotes.includes(num)
      ? currentNotes.filter((n) => n !== num)
      : [...currentNotes, num];
    set({ notes: { ...notes, [key]: newNotes } });
  },

  useHint: () => {
    const { selectedCell, currentGrid, solution, puzzle, hintsUsed, isComplete } = get();
    if (!selectedCell || isComplete) return;

    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;
    if (currentGrid[row][col] === solution[row][col]) return;

    const newGrid = currentGrid.map((r) => [...r]);
    newGrid[row][col] = solution[row][col];

    const newErrors = new Set(get().errors);
    newErrors.delete(`${row}-${col}`);

    set({ currentGrid: newGrid, errors: newErrors, hintsUsed: hintsUsed + 1 });
    setTimeout(() => get().checkCompletion(), 0);
  },

  tick: () => {
    const { isComplete, startTime } = get();
    if (isComplete || startTime === 0) return;
    set({ elapsedTime: Math.floor((Date.now() - startTime) / 1000) });
  },

  checkCompletion: () => {
    const { currentGrid, solution, score } = get();
    if (gridsEqual(currentGrid, solution)) {
      set({ isComplete: true, gameFinished: true, score: Math.max(1, score) });
    }
  },

  removePopup: (id: number) => {
    set((state) => ({
      scorePopups: state.scorePopups.filter((p) => p.id !== id),
    }));
  },
}));
