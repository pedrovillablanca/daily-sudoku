import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDailyDifficulty } from "@/lib/engine/dailyDifficulty";
import { cleanupOldScores } from "@/lib/cleanup";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "127.0.0.1";
}

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayEnd(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

interface SubmitBody {
  alias: string;
  fingerprint: string;
  score: number;
  timeSeconds: number;
  errors: number;
}

export async function POST(request: NextRequest) {
  try {
    await cleanupOldScores();
    const body: SubmitBody = await request.json();
    const { alias, fingerprint, score: clientScore, timeSeconds, errors } = body;

    if (!alias || !fingerprint || timeSeconds < 0 || errors < 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const difficulty = getDailyDifficulty();
    const ip = getClientIP(request);
    const aliasClean = alias.trim().slice(0, 20);
    const fpHash = Buffer.from(fingerprint).toString("base64").slice(0, 64);

    const today = todayStart();

    const playedByFingerprint = await prisma.score.findFirst({
      where: {
        user: { fingerprint: fpHash },
        date: { gte: today, lte: todayEnd() },
      },
    });

    if (playedByFingerprint) {
      return NextResponse.json(
        { error: "Already played today", rank: -1 },
        { status: 409 }
      );
    }

    const playedByIP = await prisma.score.findFirst({
      where: {
        ipAddress: ip,
        date: { gte: today, lte: todayEnd() },
      },
    });

    if (playedByIP) {
      return NextResponse.json(
        { error: "Already played today from this network", rank: -1 },
        { status: 409 }
      );
    }

    let user = await prisma.user.findUnique({ where: { fingerprint: fpHash } });
    if (!user) {
      user = await prisma.user.create({
        data: { alias: aliasClean, fingerprint: fpHash },
      });
    }

    const finalScore = Math.max(1, clientScore);

    await prisma.score.create({
      data: {
        userId: user.id,
        date: today,
        score: finalScore,
        timeSeconds,
        difficulty,
        errors,
        ipAddress: ip,
      },
    });

    const rank = await prisma.score.count({
      where: {
        date: { gte: todayStart(), lte: todayEnd() },
        completed: true,
        score: { gt: finalScore },
      },
    });

    return NextResponse.json({
      rank: rank + 1,
      score: finalScore,
      alias: aliasClean,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
