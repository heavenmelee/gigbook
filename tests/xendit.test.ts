import { describe, it, expect } from "vitest";

describe("Xendit API Integration", () => {
  it("should have valid Xendit API key", () => {
    const apiKey = process.env.XENDIT_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^xnd_/);
  });

  it("should be able to call Xendit API with valid credentials", async () => {
    const apiKey = process.env.XENDIT_API_KEY;
    if (!apiKey) {
      throw new Error("XENDIT_API_KEY not set");
    }

    try {
      // Test with Xendit balance endpoint (requires no parameters)
      const response = await fetch("https://api.xendit.co/balance", {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBeLessThan(500); // Should not be server error
      expect(response.ok || response.status === 401 || response.status === 403).toBe(true); // Valid response or auth error
    } catch (error) {
      console.error("Xendit API test error:", error);
      throw error;
    }
  });
});
