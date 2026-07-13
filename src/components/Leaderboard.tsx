"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatTime, formatScore } from "@/lib/scoring";

interface LeaderboardEntry {
  rank: number;
  alias: string;
  score: number;
  timeSeconds: number;
  errors: number;
  difficulty: string;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/leaderboard?date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Loading leaderboard...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No scores yet today.</p>
        <p className="text-sm text-slate-400 mt-1">Be the first to play!</p>
      </div>
    );
  }

  const rankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-[40px_1fr_80px_60px_50px] gap-2 px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-200">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Score</span>
        <span className="text-right">Time</span>
        <span className="text-right">Err</span>
      </div>
      {entries.map((entry, i) => (
        <motion.div
          key={entry.rank}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`
            grid grid-cols-[40px_1fr_80px_60px_50px] gap-2 px-3 py-2.5
            border-b border-slate-100
            ${entry.rank <= 3 ? "bg-amber-50/50" : ""}
          `}
        >
          <span
            className={`font-bold ${
              entry.rank <= 3 ? "text-amber-600" : "text-slate-500"
            }`}
          >
            {rankEmoji(entry.rank)}
          </span>
          <span className="font-medium text-slate-700 truncate">
            {entry.alias}
          </span>
          <span className="text-right font-bold text-slate-800 tabular-nums">
            {formatScore(entry.score)}
          </span>
          <span className="text-right text-slate-500 tabular-nums">
            {formatTime(entry.timeSeconds)}
          </span>
          <span className="text-right text-slate-400 tabular-nums">
            {entry.errors}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
