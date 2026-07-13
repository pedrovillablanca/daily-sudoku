"use client";

import { useGameStore } from "@/lib/store/gameStore";
import Cell from "./Cell";

export default function Board() {
  const currentGrid = useGameStore((s) => s.currentGrid);
  const puzzle = useGameStore((s) => s.puzzle);
  const solution = useGameStore((s) => s.solution);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const errors = useGameStore((s) => s.errors);
  const notes = useGameStore((s) => s.notes);

  if (!currentGrid.length) return null;

  const [selRow, selCol] = selectedCell ?? [-1, -1];
  const selectedValue =
    selRow >= 0 && selCol >= 0 ? currentGrid[selRow][selCol] : 0;

  return (
    <div className="inline-flex flex-col items-center">
      <div className="border-2 border-slate-800 rounded-sm overflow-hidden shadow-lg">
        {currentGrid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((val, c) => {
              const isInitial = puzzle[r][c] !== 0;
              const isSelected = selRow === r && selCol === c;
              const isError = errors.has(`${r}-${c}`);
              const isCorrect =
                !isInitial && val !== 0 && val === solution[r][c] && !isError;
              const isSameNumber =
                selectedValue !== 0 && val === selectedValue;

              const sameRow = selRow === r;
              const sameCol = selCol === c;
              const sameBox =
                selRow >= 0 &&
                selCol >= 0 &&
                Math.floor(r / 3) === Math.floor(selRow / 3) &&
                Math.floor(c / 3) === Math.floor(selCol / 3);
              const isSameRowColBox = sameRow || sameCol || sameBox;

              const cellNotes = notes[`${r}-${c}`] || [];

              return (
                <Cell
                  key={`${r}-${c}`}
                  row={r}
                  col={c}
                  value={val}
                  isInitial={isInitial}
                  isSelected={isSelected}
                  isError={isError}
                  isCorrect={isCorrect}
                  isSameNumber={isSameNumber}
                  isSameRowColBox={isSameRowColBox}
                  selectedValue={selectedValue}
                  notes={cellNotes}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
