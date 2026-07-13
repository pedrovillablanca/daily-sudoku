import { describe, it, expect } from "vitest";
import {
  getPointsPerNumber,
  getStreakBonus,
  calculateNumberPoints,
  calculateWrongPenalty,
  formatTime,
  formatScore,
  getDifficultyMultiplier,
} from "@/lib/scoring";

describe("scoring", () => {
  it("getPointsPerNumber at t=0 easy = 100", () => {
    expect(getPointsPerNumber(0, "easy")).toBe(100);
  });

  it("getPointsPerNumber at t=0 medium = 120", () => {
    expect(getPointsPerNumber(0, "medium")).toBe(120);
  });

  it("getPointsPerNumber at t=0 hard = 150", () => {
    expect(getPointsPerNumber(0, "hard")).toBe(150);
  });

  it("getPointsPerNumber at t=0 expert = 200", () => {
    expect(getPointsPerNumber(0, "expert")).toBe(200);
  });

  it("getPointsPerNumber decays by 5 every 30s", () => {
    expect(getPointsPerNumber(30, "easy")).toBe(95);
    expect(getPointsPerNumber(60, "easy")).toBe(90);
    expect(getPointsPerNumber(300, "easy")).toBe(50);
  });

  it("getPointsPerNumber minimum is 50 * multiplier", () => {
    expect(getPointsPerNumber(10000, "easy")).toBe(50);
    expect(getPointsPerNumber(10000, "expert")).toBe(100);
  });

  it("getStreakBonus = min(streak * 10, 50)", () => {
    expect(getStreakBonus(0)).toBe(0);
    expect(getStreakBonus(3)).toBe(30);
    expect(getStreakBonus(5)).toBe(50);
    expect(getStreakBonus(10)).toBe(50);
  });

  it("calculateNumberPoints = base + streak", () => {
    expect(calculateNumberPoints(0, "easy", 0)).toBe(100);
    expect(calculateNumberPoints(0, "easy", 3)).toBe(130);
  });

  it("calculateWrongPenalty = -25", () => {
    expect(calculateWrongPenalty()).toBe(-25);
  });

  it("getDifficultyMultiplier", () => {
    expect(getDifficultyMultiplier("easy")).toBe(1.0);
    expect(getDifficultyMultiplier("medium")).toBe(1.2);
    expect(getDifficultyMultiplier("hard")).toBe(1.5);
    expect(getDifficultyMultiplier("expert")).toBe(2.0);
  });

  it("formatTime", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(125)).toBe("02:05");
  });

  it("formatScore", () => {
    expect(formatScore(1234)).toBe("1,234");
  });
});
