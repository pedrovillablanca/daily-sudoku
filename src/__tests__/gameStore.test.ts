import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/lib/store/gameStore";

// Helper to set up a minimal game state for testing
function setupMinimalGame() {
  const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  // Set the store state directly
  useGameStore.setState({
    puzzle,
    solution,
    currentGrid: puzzle.map((r) => [...r]),
    selectedCell: null,
    errors: new Set<string>(),
    totalErrors: 0,
    difficulty: "easy",
    isComplete: false,
    startTime: 1000,
    elapsedTime: 10,
    score: 0,
    streak: 0,
    notesMode: false,
    notes: {},
    puzzleLoaded: true,
    gameStarted: true,
    gameFinished: false,
    scorePopups: [],
    lastPopupId: 0,
  });
}

describe("gameStore - enterNumber and totalErrors", () => {
  beforeEach(() => {
    setupMinimalGame();
  });

  it("entering wrong number increments totalErrors and adds to errors Set", () => {
    // Cell (0,2) should be 4 (from solution)
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().enterNumber(7); // wrong!

    const state = useGameStore.getState();
    expect(state.totalErrors).toBe(1);
    expect(state.errors.has("0-2")).toBe(true);
    expect(state.score).toBe(0); // max(0, 0 - 25) = 0
  });

  it("entering wrong number twice increments totalErrors twice", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().enterNumber(7); // wrong!
    useGameStore.getState().enterNumber(6); // wrong again (cell already has 7)

    const state = useGameStore.getState();
    // First wrong: totalErrors=1, second wrong: the cell had 7, entering 6
    // currentVal(7) !== num(6), so it proceeds, 6 !== solution[0][2](4), so it's wrong
    expect(state.totalErrors).toBe(2);
    expect(state.errors.has("0-2")).toBe(true);
  });

  it("entering wrong then correct keeps totalErrors=1 but removes from errors Set", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().enterNumber(7); // wrong
    useGameStore.getState().enterNumber(4); // correct (solution[0][2] = 4)

    const state = useGameStore.getState();
    expect(state.totalErrors).toBe(1); // totalErrors doesn't decrease
    expect(state.errors.has("0-2")).toBe(false); // but errors Set removes it
  });

  it("dedup guard: entering same number does nothing", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().enterNumber(7); // wrong
    useGameStore.getState().enterNumber(7); // same value → should be no-op

    const state = useGameStore.getState();
    expect(state.totalErrors).toBe(1); // not 2
    expect(state.currentGrid[0][2]).toBe(7);
    expect(state.score).toBe(0); // only 1 penalty of -25, max(0, -25) = 0
  });

  it("entering correct number doesn't increment totalErrors", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().enterNumber(4); // correct

    const state = useGameStore.getState();
    expect(state.totalErrors).toBe(0);
    expect(state.errors.size).toBe(0);
  });

  it("totalErrors resets to 0 on initGame", () => {
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().enterNumber(7); // wrong → totalErrors=1

    useGameStore.getState().initGame();

    const state = useGameStore.getState();
    expect(state.totalErrors).toBe(0);
    expect(state.errors.size).toBe(0);
  });

  it("cannot enter number on a puzzle (given) cell", () => {
    // Cell (0,0) = 5 is given in puzzle
    useGameStore.getState().selectCell(0, 0);
    useGameStore.getState().enterNumber(9);

    const state = useGameStore.getState();
    expect(state.currentGrid[0][0]).toBe(5); // unchanged
    expect(state.totalErrors).toBe(0);
  });

  it("cannot enter number when game is complete", () => {
    useGameStore.setState({ isComplete: true });
    useGameStore.getState().selectCell(0, 2);
    useGameStore.getState().enterNumber(4);

    const state = useGameStore.getState();
    expect(state.totalErrors).toBe(0);
  });
});

describe("gameStore - checkCompletion", () => {
  beforeEach(() => {
    setupMinimalGame();
  });

  it("completes when all cells match solution", () => {
    // Fill all empty cells correctly
    const solution = useGameStore.getState().solution;
    const puzzle = useGameStore.getState().puzzle;
    const grid = puzzle.map((r) => [...r]);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === 0) {
          grid[r][c] = solution[r][c];
        }
      }
    }

    useGameStore.setState({ currentGrid: grid });
    useGameStore.getState().checkCompletion();

    expect(useGameStore.getState().isComplete).toBe(true);
  });
});
