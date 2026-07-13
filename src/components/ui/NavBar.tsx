"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface NavBarProps {
  current?: "game" | "leaderboard";
}

export default function NavBar({ current = "game" }: NavBarProps) {
  return (
    <nav className="flex items-center justify-center gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto mb-4">
      <Link
        href="/"
        className={`
          relative px-4 py-1.5 rounded-md text-sm font-medium transition-colors
          ${current === "game" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}
        `}
      >
        {current === "game" && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-white rounded-md shadow-sm"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">Play</span>
      </Link>
      <Link
        href="/leaderboard"
        className={`
          relative px-4 py-1.5 rounded-md text-sm font-medium transition-colors
          ${current === "leaderboard" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"}
        `}
      >
        {current === "leaderboard" && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-white rounded-md shadow-sm"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">Leaderboard</span>
      </Link>
    </nav>
  );
}
