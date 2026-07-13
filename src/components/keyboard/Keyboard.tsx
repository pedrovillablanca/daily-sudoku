"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { useEffect, useCallback } from "react";

export default function Keyboard() {
  const enterNumber = useGameStore((s) => s.enterNumber);
  const eraseNumber = useGameStore((s) => s.eraseNumber);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const notesMode = useGameStore((s) => s.notesMode);
  const currentGrid = useGameStore((s) => s.currentGrid);
  const isComplete = useGameStore((s) => s.isComplete);

  const countNumber = useCallback(
    (num: number) => {
      let count = 0;
      for (const row of currentGrid) {
        for (const val of row) {
          if (val === num) count++;
        }
      }
      return count;
    },
    [currentGrid]
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key >= "1" && key <= "9") {
        enterNumber(parseInt(key));
      } else if (key === "Backspace" || key === "Delete") {
        eraseNumber();
      }
    },
    [enterNumber, eraseNumber]
  );

  useEffect(() => {
    if (isComplete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleKeyPress(e.key);
      } else if (e.key === "n" || e.key === "N") {
        toggleNotesMode();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyPress, toggleNotesMode, isComplete]);

  const topRow = [1, 2, 3, 4, 5];
  const bottomRow = [6, 7, 8, 9];

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex gap-1.5">
        {topRow.map((num) => {
          const remaining = 9 - countNumber(num);
          return (
            <motion.button
              key={num}
              className={`
                relative flex items-center justify-center
                w-[48px] h-[56px] sm:w-[56px] sm:h-[64px]
                rounded-lg font-bold text-xl
                ${
                  remaining === 0
                    ? "bg-slate-100 text-slate-300"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300 active:bg-slate-400"
                }
                shadow-sm
                transition-colors
              `}
              whileTap={{ scale: 0.9 }}
              onClick={() => enterNumber(num)}
              disabled={remaining === 0}
            >
              {num}
              {remaining > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-slate-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {remaining}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {bottomRow.map((num) => {
          const remaining = 9 - countNumber(num);
          return (
            <motion.button
              key={num}
              className={`
                relative flex items-center justify-center
                w-[48px] h-[56px] sm:w-[56px] sm:h-[64px]
                rounded-lg font-bold text-xl
                ${
                  remaining === 0
                    ? "bg-slate-100 text-slate-300"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300 active:bg-slate-400"
                }
                shadow-sm
                transition-colors
              `}
              whileTap={{ scale: 0.9 }}
              onClick={() => enterNumber(num)}
              disabled={remaining === 0}
            >
              {num}
              {remaining > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-slate-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {remaining}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        <motion.button
          className={`
            flex items-center justify-center
            w-[60px] h-[44px] sm:w-[68px] sm:h-[48px]
            rounded-lg font-medium text-sm
            ${
              notesMode
                ? "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }
            shadow-sm transition-colors
          `}
          whileTap={{ scale: 0.9 }}
          onClick={toggleNotesMode}
        >
          Notes
        </motion.button>
        <motion.button
          className="
            flex items-center justify-center
            w-[60px] h-[44px] sm:w-[68px] sm:h-[48px]
            rounded-lg font-medium text-sm
            bg-slate-200 text-slate-600 hover:bg-slate-300
            shadow-sm transition-colors
          "
          whileTap={{ scale: 0.9 }}
          onClick={eraseNumber}
        >
          Erase
        </motion.button>
      </div>
    </div>
  );
}
