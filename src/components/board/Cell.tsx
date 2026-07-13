"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { useEffect } from "react";

interface CellProps {
  row: number;
  col: number;
  value: number;
  isInitial: boolean;
  isSelected: boolean;
  isError: boolean;
  isCorrect: boolean;
  isSameNumber: boolean;
  isSameRowColBox: boolean;
  selectedValue: number;
  notes: number[];
}

export default function Cell({
  row,
  col,
  value,
  isInitial,
  isSelected,
  isError,
  isCorrect,
  isSameNumber,
  isSameRowColBox,
  selectedValue,
  notes,
}: CellProps) {
  const selectCell = useGameStore((s) => s.selectCell);
  const scorePopups = useGameStore((s) => s.scorePopups);
  const removePopup = useGameStore((s) => s.removePopup);

  const popup = scorePopups.find((p) => p.row === row && p.col === col);

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => removePopup(popup.id), 1200);
      return () => clearTimeout(timer);
    }
  }, [popup, removePopup]);

  const borderClasses = [];
  if (col % 3 === 0) borderClasses.push("border-l-2 border-l-slate-800");
  if (col === 8) borderClasses.push("border-r-2 border-r-slate-800");
  if (row % 3 === 0) borderClasses.push("border-t-2 border-t-slate-800");
  if (row === 8) borderClasses.push("border-b-2 border-b-slate-800");

  let bgClass = "bg-white";
  if (isSelected) {
    bgClass = "bg-blue-200";
  } else if (isError && !isInitial) {
    bgClass = "bg-red-100";
  } else if (isSameNumber && value !== 0) {
    bgClass = "bg-blue-100";
  } else if (isSameRowColBox) {
    bgClass = "bg-indigo-50";
  }

  let numberColor = "";
  if (isInitial) {
    numberColor = "text-slate-900";
  } else if (isError) {
    numberColor = "text-red-500";
  } else if (isCorrect) {
    numberColor = "text-emerald-600";
  } else {
    numberColor = "text-blue-600";
  }

  if (isSameNumber && value !== 0 && !isSelected) {
    numberColor = "text-blue-700 font-extrabold";
  }

  return (
    <div className="relative">
      <motion.button
        className={`
          relative flex items-center justify-center
          w-[38px] h-[38px] sm:w-[46px] sm:h-[46px]
          border border-slate-300
          ${borderClasses.join(" ")}
          ${bgClass}
          transition-colors duration-100
          focus:outline-none
        `}
        onClick={() => selectCell(row, col)}
        whileTap={{ scale: 0.92 }}
        animate={
          isError && !isInitial
            ? { x: [0, -3, 3, -3, 3, 0] }
            : { x: 0 }
        }
        transition={
          isError && !isInitial
            ? { duration: 0.3 }
            : { type: "spring", stiffness: 500, damping: 30 }
        }
      >
        {value !== 0 ? (
          <motion.span
            key={`value-${row}-${col}-${value}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-lg sm:text-xl font-bold ${numberColor}`}
          >
            {value}
          </motion.span>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <span
                key={n}
                className={`flex items-center justify-center text-[8px] sm:text-[10px] leading-none ${
                  notes.includes(n)
                    ? n === selectedValue
                      ? "text-blue-700 font-extrabold"
                      : "text-slate-500 font-medium"
                    : "text-transparent"
                }`}
              >
                {notes.includes(n) ? n : ""}
              </span>
            ))}
          </div>
        ) : null}

        {isSelected && (
          <motion.div
            className="absolute inset-0 border-2 border-blue-600 rounded-sm pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: 0, x: "-50%" }}
            animate={{ opacity: 0, y: -28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`
              absolute -top-1 left-1/2 z-10
              text-xs font-bold pointer-events-none whitespace-nowrap
              ${popup.isCorrect ? "text-green-600" : "text-red-500"}
            `}
          >
            {popup.isCorrect ? "+" : ""}{popup.points}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
