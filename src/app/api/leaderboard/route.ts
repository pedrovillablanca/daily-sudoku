import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupOldScores } from "@/lib/cleanup";

export async function GET(request: NextRequest) {
  await cleanupOldScores();
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");
  const limit = parseInt(searchParams.get("limit") || "50");

  const date = dateParam ? new Date(dateParam) : new Date();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const scores = await prisma.score.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      completed: true,
    },
    include: {
      user: {
        select: {
          alias: true,
        },
      },
    },
    orderBy: [{ score: "desc" }, { timeSeconds: "asc" }],
    take: Math.min(limit, 100),
  });

  const ranked = scores.map((s, i) => ({
    rank: i + 1,
    alias: s.user.alias,
    score: s.score,
    timeSeconds: s.timeSeconds,
    errors: s.errors,
    difficulty: s.difficulty,
  }));

  return NextResponse.json(ranked);
}
