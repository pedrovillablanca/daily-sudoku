import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

export async function GET(request: NextRequest) {
  await cleanupOldScores();
  const searchParams = request.nextUrl.searchParams;
  const fingerprint = searchParams.get("fingerprint");
  const dateParam = searchParams.get("date");

  if (!fingerprint || !dateParam) {
    return NextResponse.json({ played: false });
  }

  const ip = getClientIP(request);
  const fpHash = Buffer.from(fingerprint).toString("base64").slice(0, 64);

  const today = new Date(dateParam);
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateParam);
  endOfDay.setHours(23, 59, 59, 999);

  const playedByFingerprint = await prisma.score.findFirst({
    where: {
      user: { fingerprint: fpHash },
      date: { gte: today, lte: endOfDay },
    },
  });

  if (playedByFingerprint) {
    return NextResponse.json({ played: true, reason: "fingerprint" });
  }

  const playedByIP = await prisma.score.findFirst({
    where: {
      ipAddress: ip,
      date: { gte: today, lte: endOfDay },
    },
  });

  if (playedByIP) {
    return NextResponse.json({ played: true, reason: "ip" });
  }

  return NextResponse.json({ played: false });
}
