"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ScoreSubmitterProps {
  score: number;
  timeSeconds: number;
  errors: number;
  difficulty: string;
  initialAlias?: string;
  hideAliasInput?: boolean;
  onSuccess: (rank: number) => void;
}

export default function ScoreSubmitter({
  score,
  timeSeconds,
  errors,
  difficulty,
  initialAlias = "",
  hideAliasInput = false,
  onSuccess,
}: ScoreSubmitterProps) {
  const [alias, setAlias] = useState(initialAlias);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getFingerprint = async (): Promise<string> => {
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
  };

  const handleSubmit = async () => {
    if (!alias.trim()) {
      setError("Please enter a name");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const fingerprint = await getFingerprint();
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias: alias.trim(),
          fingerprint,
          score,
          timeSeconds,
          errors,
          difficulty,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError("You already played today!");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to submit");
        return;
      }

      localStorage.setItem("daily-sudoku-alias", alias.trim());
      onSuccess(data.rank);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xs"
    >
      {!hideAliasInput && (
        <p className="text-sm text-slate-500 mb-3 text-center">
          Submit your score to the global leaderboard
        </p>
      )}
      {hideAliasInput ? (
        <div className="flex justify-center">
          <motion.button
            className="
              px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm
              hover:bg-blue-600 disabled:opacity-50
            "
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={submitting || !alias.trim()}
          >
            {submitting ? "..." : "Submit Score"}
          </motion.button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={alias}
            onChange={(e) => {
              setAlias(e.target.value);
              setError("");
            }}
            placeholder="Your nickname"
            maxLength={20}
            className="
              flex-1 px-3 py-2 rounded-lg border border-slate-300
              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent
            "
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <motion.button
            className="
              px-4 py-2 rounded-lg bg-blue-500 text-white font-medium text-sm
              hover:bg-blue-600 disabled:opacity-50
            "
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={submitting || !alias.trim()}
          >
            {submitting ? "..." : "Submit"}
          </motion.button>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </motion.div>
  );
}
