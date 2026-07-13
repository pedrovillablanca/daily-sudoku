import { prisma } from "@/lib/prisma";

let lastCleanupDate: string | null = null;

export async function cleanupOldScores() {
  const today = new Date().toISOString().split("T")[0];

  if (lastCleanupDate === today) return;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  await prisma.score.deleteMany({
    where: {
      date: { lt: todayStart },
    },
  });

  lastCleanupDate = today;
}
