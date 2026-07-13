"use client";

import { motion } from "framer-motion";
import { Difficulty } from "@/lib/engine/types";

interface DifficultyPickerProps {
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties: { key: Difficulty; label: string; desc: string; color: string }[] = [
  { key: "easy", label: "Easy", desc: "30-40 cells removed", color: "bg-green-500 hover:bg-green-600" },
  { key: "medium", label: "Medium", desc: "40-50 cells removed", color: "bg-yellow-500 hover:bg-yellow-600" },
  { key: "hard", label: "Hard", desc: "50-55 cells removed", color: "bg-orange-500 hover:bg-orange-600" },
  { key: "expert", label: "Expert", desc: "55-60 cells removed", color: "bg-red-500 hover:bg-red-600" },
];

export default function DifficultyPicker({ onSelect }: DifficultyPickerProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          Daily Sudoku
        </h1>
        <p className="text-slate-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-600"
      >
        Choose your difficulty:
      </motion.p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {difficulties.map((d, i) => (
          <motion.button
            key={d.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`
              ${d.color} text-white rounded-xl px-4 py-3
              shadow-md transition-colors
              flex flex-col items-center
            `}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(d.key)}
          >
            <span className="font-bold text-lg">{d.label}</span>
            <span className="text-xs opacity-80">{d.desc}</span>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-slate-400 mt-4"
      >
        One puzzle per day. One attempt only.
      </motion.p>
    </div>
  );
}
