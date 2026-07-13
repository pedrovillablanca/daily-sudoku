"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/store/gameStore";
import { formatTime } from "@/lib/scoring";

export default function Timer() {
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const isComplete = useGameStore((s) => s.isComplete);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    if (!gameStarted || isComplete) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick, gameStarted, isComplete]);

  return (
    <div className="flex items-center gap-4">
      <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-700 tabular-nums">
        {formatTime(elapsedTime)}
      </div>
    </div>
  );
}
