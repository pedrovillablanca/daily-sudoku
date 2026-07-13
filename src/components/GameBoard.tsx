"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import Board from "@/components/board/Board";
import Keyboard from "@/components/keyboard/Keyboard";
import Timer from "@/components/ui/Timer";
import VictoryModal from "@/components/ui/VictoryModal";
import { getDifficultyLabel } from "@/lib/engine/dailyDifficulty";
import { formatScore } from "@/lib/scoring";

export default function GameBoard() {
  const puzzleLoaded = useGameStore((s) => s.puzzleLoaded);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const initGame = useGameStore((s) => s.initGame);
  const startGame = useGameStore((s) => s.startGame);
  const checkCompletion = useGameStore((s) => s.checkCompletion);
  const isComplete = useGameStore((s) => s.isComplete);
  const difficulty = useGameStore((s) => s.difficulty);
  const errors = useGameStore((s) => s.errors);
  const notesMode = useGameStore((s) => s.notesMode);
  const alreadyPlayed = useGameStore((s) => s.alreadyPlayed);
  const blockedByIP = useGameStore((s) => s.blockedByIP);
  const setAlreadyPlayed = useGameStore((s) => s.setAlreadyPlayed);
  const setBlockedByIP = useGameStore((s) => s.setBlockedByIP);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const score = useGameStore((s) => s.score);
  const streak = useGameStore((s) => s.streak);

  const [nicknameInput, setNicknameInput] = useState("");

  const getFingerprint = useCallback(async (): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("fingerprint", 2, 2);
    }
    const data = canvas.toDataURL();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }, []);

  useEffect(() => {
    if (gameStarted && !isComplete) {
      checkCompletion();
    }
  }, [gameStarted, isComplete, checkCompletion]);

  useEffect(() => {
    async function checkPlayed() {
      const today = new Date().toISOString().split("T")[0];
      const localKey = `daily-sudoku-played-${today}`;
      if (localStorage.getItem(localKey)) {
        setAlreadyPlayed(true);
        return;
      }

      try {
        const fp = await getFingerprint();
        const res = await fetch(`/api/check-played?fingerprint=${encodeURIComponent(fp)}&date=${today}`);
        if (res.ok) {
          const data = await res.json();
          if (data.played) {
            setAlreadyPlayed(true);
            setBlockedByIP(true);
          }
        }
      } catch {
        // If API is unreachable, rely on local storage only
      }
    }
    if (!puzzleLoaded) {
      checkPlayed();
    }
  }, [puzzleLoaded, getFingerprint, setAlreadyPlayed, setBlockedByIP]);

  useEffect(() => {
    if (isComplete) {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(`daily-sudoku-played-${today}`, "true");
    }
  }, [isComplete]);

  useEffect(() => {
    if (gameStarted && !isComplete) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [gameStarted, isComplete]);

  useEffect(() => {
    const saved = localStorage.getItem("daily-sudoku-nickname");
    if (saved) {
      setNicknameInput(saved);
    }
  }, []);

  if (!puzzleLoaded) {
    if (alreadyPlayed) {
      return (
        <div className="flex flex-col items-center gap-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Already Played Today
            </h1>
            <p className="text-slate-500 max-w-xs">
              {blockedByIP
                ? "This device has already completed today's puzzle."
                : "You've already completed today's puzzle. Come back tomorrow!"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-slate-400 mb-4">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <a
              href="/leaderboard"
              className="text-blue-500 hover:text-blue-600 underline text-sm"
            >
              View today&apos;s leaderboard
            </a>
          </motion.div>
        </div>
      );
    }

    initGame();
    return null;
  }

  if (!gameStarted) {
    const canStart = nicknameInput.trim().length > 0;

    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
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
          <p className="text-sm text-slate-400 mt-2 capitalize">
            {getDifficultyLabel(difficulty)} Difficulty
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-xs"
        >
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            Nickname
          </label>
          <input
            type="text"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Enter your nickname"
            maxLength={20}
            className="
              w-full px-4 py-2.5 rounded-xl border border-slate-300
              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent text-center
            "
            onKeyDown={(e) => {
              if (e.key === "Enter" && canStart) {
                localStorage.setItem("daily-sudoku-nickname", nicknameInput.trim());
                setNickname(nicknameInput.trim());
                startGame();
              }
            }}
          />
        </motion.div>

        <div className="opacity-30 pointer-events-none">
          <Board />
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: canStart ? 1 : 0.4, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className={`
            px-8 py-3 rounded-xl font-bold text-lg shadow-lg
            transition-colors
            ${canStart
              ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }
          `}
          whileHover={canStart ? { scale: 1.03 } : {}}
          whileTap={canStart ? { scale: 0.97 } : {}}
          onClick={() => {
            if (!canStart) return;
            localStorage.setItem("daily-sudoku-nickname", nicknameInput.trim());
            setNickname(nicknameInput.trim());
            startGame();
          }}
          disabled={!canStart}
        >
          Start
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-slate-400"
        >
          One puzzle per day. One attempt only.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center justify-between w-full max-w-[430px] px-2">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
        <Timer />
        <div className="text-right">
          <span className="text-xs text-red-400">
            {errors.size > 0 ? `${errors.size} error${errors.size > 1 ? "s" : ""}` : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 w-full max-w-[430px]">
        <motion.div
          key={score}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="text-center"
        >
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 tabular-nums">
            {formatScore(score)}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Score</div>
        </motion.div>

        {streak > 1 && (
          <motion.div
            key={streak}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-lg font-bold text-amber-500">
              {streak}x
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Streak</div>
          </motion.div>
        )}
      </div>

      <Board />

      {notesMode && (
        <div className="text-xs text-blue-500 font-medium">
          Notes mode ON
        </div>
      )}

      <Keyboard />

      <VictoryModal />

      {!isComplete && (
        <button
          onClick={() => {
            if (confirm("Are you sure? This will reset your current game.")) {
              window.location.reload();
            }
          }}
          className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Start over
        </button>
      )}
    </div>
  );
}
