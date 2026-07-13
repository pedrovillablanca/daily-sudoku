"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { formatTime, formatScore } from "@/lib/scoring";
import ScoreSubmitter from "@/components/ScoreSubmitter";

export default function VictoryModal() {
  const isComplete = useGameStore((s) => s.isComplete);
  const score = useGameStore((s) => s.score);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const errors = useGameStore((s) => s.errors);
  const difficulty = useGameStore((s) => s.difficulty);
  const nickname = useGameStore((s) => s.nickname);

  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {isComplete && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              className="text-5xl mb-4"
            >
              🎉
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Congratulations!
            </h2>
            <p className="text-slate-500 mb-6">You completed today&apos;s puzzle</p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-blue-600 mb-1"
              >
                {formatScore(score)}
              </motion.div>
              <p className="text-sm text-slate-500">points</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <div className="font-bold text-slate-700">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-slate-400">Time</div>
              </div>
              <div>
                <div className="font-bold text-slate-700">{errors.size}</div>
                <div className="text-slate-400">Errors</div>
              </div>
              <div>
                <div className="font-bold text-slate-700 capitalize">
                  {difficulty}
                </div>
                <div className="text-slate-400">Difficulty</div>
              </div>
            </div>

            {!submitted ? (
              <ScoreSubmitter
                score={score}
                timeSeconds={elapsedTime}
                errors={errors.size}
                difficulty={difficulty}
                initialAlias={nickname}
                onSuccess={(r) => {
                  setSubmitted(true);
                  setRank(r);
                }}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-green-600 font-medium mb-1">
                  Score submitted!
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  You&apos;re ranked <span className="font-bold">#{rank}</span> today
                </p>
                <a
                  href="/leaderboard"
                  className="inline-block px-6 py-2.5 rounded-xl font-medium text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  View Leaderboard
                </a>
              </motion.div>
            )}

            <p className="text-xs text-slate-400 mt-6">
              Come back tomorrow for a new puzzle!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
