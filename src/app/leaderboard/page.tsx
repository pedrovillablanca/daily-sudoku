import type { Metadata } from "next";
import NavBar from "@/components/ui/NavBar";
import Leaderboard from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See today's top Sudoku players. Check your rank and compete on the global daily leaderboard.",
  alternates: {
    canonical: "https://dailysudoku.online/leaderboard",
  },
};

export default function LeaderboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex flex-col items-center min-h-screen w-full max-w-lg mx-auto px-4 py-8">
      <NavBar current="leaderboard" />
      <div className="w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Leaderboard</h1>
          <p className="text-sm text-slate-500 mt-1">{today}</p>
        </div>
        <Leaderboard />
      </div>
    </main>
  );
}
