"use client";

import GameBoard from "@/components/GameBoard";
import NavBar from "@/components/ui/NavBar";
import AdUnit from "@/components/AdUnit";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen w-full max-w-lg mx-auto px-4 py-8">
      <NavBar current="game" />
      <GameBoard />
      <AdUnit />
    </main>
  );
}
