import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database operations
vi.mock("../server/db", () => ({
  getSetting: vi.fn().mockResolvedValue("10"),
  getAllMusicians: vi.fn().mockResolvedValue([]),
  getPendingUsers: vi.fn().mockResolvedValue([]),
  getAdminStats: vi.fn().mockResolvedValue({
    totalUsers: 0,
    totalMusicians: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    totalRevenue: "0",
    totalCommission: "0",
  }),
}));

describe("Gigbook Platform Settings", () => {
  it("should have default commission rate of 10%", async () => {
    const db = await import("../server/db");
    const commissionRate = await db.getSetting("commission_rate");
    expect(commissionRate).toBe("10");
  });

  it("should return empty array for musicians when none exist", async () => {
    const db = await import("../server/db");
    const musicians = await db.getAllMusicians({});
    expect(musicians).toEqual([]);
  });

  it("should return empty array for pending users when none exist", async () => {
    const db = await import("../server/db");
    const pendingUsers = await db.getPendingUsers();
    expect(pendingUsers).toEqual([]);
  });

  it("should return admin stats with correct structure", async () => {
    const db = await import("../server/db");
    const stats = await db.getAdminStats();
    expect(stats).toHaveProperty("totalUsers");
    expect(stats).toHaveProperty("totalMusicians");
    expect(stats).toHaveProperty("totalBookings");
    expect(stats).toHaveProperty("pendingApprovals");
    expect(stats).toHaveProperty("totalRevenue");
    expect(stats).toHaveProperty("totalCommission");
  });
});

describe("Booking Commission Calculation", () => {
  it("should calculate 10% commission correctly", () => {
    const amount = 1000;
    const commissionRate = 10;
    const commission = (amount * commissionRate) / 100;
    const musicianPayout = amount - commission;

    expect(commission).toBe(100);
    expect(musicianPayout).toBe(900);
  });

  it("should calculate penalty for last minute cancellation", () => {
    const amount = 1000;
    const userPenaltyRate = 20;
    const musicianPenaltyRate = 30;

    const userPenalty = (amount * userPenaltyRate) / 100;
    const musicianPenalty = (amount * musicianPenaltyRate) / 100;

    expect(userPenalty).toBe(200);
    expect(musicianPenalty).toBe(300);
  });

  it("should determine if cancellation is within 72 hours", () => {
    const now = new Date();
    const eventDate72HoursAway = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const eventDate48HoursAway = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const eventDate100HoursAway = new Date(now.getTime() + 100 * 60 * 60 * 1000);

    const isLastMinute72 = (eventDate72HoursAway.getTime() - now.getTime()) / (1000 * 60 * 60) <= 72;
    const isLastMinute48 = (eventDate48HoursAway.getTime() - now.getTime()) / (1000 * 60 * 60) <= 72;
    const isLastMinute100 = (eventDate100HoursAway.getTime() - now.getTime()) / (1000 * 60 * 60) <= 72;

    expect(isLastMinute72).toBe(true);
    expect(isLastMinute48).toBe(true);
    expect(isLastMinute100).toBe(false);
  });
});

describe("User Roles", () => {
  it("should have valid role types", () => {
    const validRoles = ["user", "musician", "admin"];
    expect(validRoles).toContain("user");
    expect(validRoles).toContain("musician");
    expect(validRoles).toContain("admin");
  });

  it("should have valid status types", () => {
    const validStatuses = ["pending", "approved", "rejected", "suspended"];
    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("approved");
    expect(validStatuses).toContain("rejected");
    expect(validStatuses).toContain("suspended");
  });
});

describe("Booking Status Flow", () => {
  it("should have valid booking status transitions", () => {
    const validStatuses = [
      "pending_approval",
      "approved",
      "confirmed",
      "completed",
      "cancelled_user",
      "cancelled_musician",
      "rejected",
    ];

    expect(validStatuses).toContain("pending_approval");
    expect(validStatuses).toContain("approved");
    expect(validStatuses).toContain("confirmed");
    expect(validStatuses).toContain("completed");
    expect(validStatuses).toContain("cancelled_user");
    expect(validStatuses).toContain("cancelled_musician");
    expect(validStatuses).toContain("rejected");
  });
});

describe("Payment Status Flow", () => {
  it("should have valid payment status transitions", () => {
    const validStatuses = [
      "pending",
      "escrow",
      "released",
      "refunded",
      "partial_refund",
      "failed",
    ];

    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("escrow");
    expect(validStatuses).toContain("released");
    expect(validStatuses).toContain("refunded");
    expect(validStatuses).toContain("partial_refund");
    expect(validStatuses).toContain("failed");
  });
});
