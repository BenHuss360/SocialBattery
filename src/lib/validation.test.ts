import { describe, it, expect } from "vitest";

// Username validation rules (matching the API route logic)
function isValidUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username || username.length < 3 || username.length > 20) {
    return { valid: false, error: "Invalid username length" };
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { valid: false, error: "Invalid characters" };
  }

  const reserved = [
    "admin",
    "api",
    "dashboard",
    "login",
    "logout",
    "settings",
    "onboarding",
    "check-email",
    "profile",
    "help",
    "about",
    "terms",
    "privacy",
  ];

  if (reserved.includes(username)) {
    return { valid: false, error: "Reserved username" };
  }

  return { valid: true };
}

// Battery level validation
function isValidBatteryLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= 5;
}

// Status text validation
function isValidStatusText(text: string): boolean {
  return text.length <= 30;
}

describe("Username Validation", () => {
  it("accepts valid usernames", () => {
    expect(isValidUsername("john")).toEqual({ valid: true });
    expect(isValidUsername("john_doe")).toEqual({ valid: true });
    expect(isValidUsername("user123")).toEqual({ valid: true });
    expect(isValidUsername("abc")).toEqual({ valid: true });
    expect(isValidUsername("a".repeat(20))).toEqual({ valid: true });
  });

  it("rejects usernames that are too short", () => {
    expect(isValidUsername("ab").valid).toBe(false);
    expect(isValidUsername("a").valid).toBe(false);
    expect(isValidUsername("").valid).toBe(false);
  });

  it("rejects usernames that are too long", () => {
    expect(isValidUsername("a".repeat(21)).valid).toBe(false);
  });

  it("rejects usernames with invalid characters", () => {
    expect(isValidUsername("John").valid).toBe(false); // uppercase
    expect(isValidUsername("john-doe").valid).toBe(false); // hyphen
    expect(isValidUsername("john.doe").valid).toBe(false); // period
    expect(isValidUsername("john doe").valid).toBe(false); // space
    expect(isValidUsername("john@doe").valid).toBe(false); // @
  });

  it("rejects reserved usernames", () => {
    expect(isValidUsername("admin").valid).toBe(false);
    expect(isValidUsername("api").valid).toBe(false);
    expect(isValidUsername("dashboard").valid).toBe(false);
    expect(isValidUsername("login").valid).toBe(false);
    expect(isValidUsername("settings").valid).toBe(false);
  });
});

describe("Battery Level Validation", () => {
  it("accepts valid levels 1-5", () => {
    expect(isValidBatteryLevel(1)).toBe(true);
    expect(isValidBatteryLevel(2)).toBe(true);
    expect(isValidBatteryLevel(3)).toBe(true);
    expect(isValidBatteryLevel(4)).toBe(true);
    expect(isValidBatteryLevel(5)).toBe(true);
  });

  it("rejects levels outside 1-5", () => {
    expect(isValidBatteryLevel(0)).toBe(false);
    expect(isValidBatteryLevel(6)).toBe(false);
    expect(isValidBatteryLevel(-1)).toBe(false);
    expect(isValidBatteryLevel(100)).toBe(false);
  });

  it("rejects non-integer levels", () => {
    expect(isValidBatteryLevel(3.5)).toBe(false);
    expect(isValidBatteryLevel(2.1)).toBe(false);
  });
});

describe("Status Text Validation", () => {
  it("accepts text within 30 characters", () => {
    expect(isValidStatusText("")).toBe(true);
    expect(isValidStatusText("Hello")).toBe(true);
    expect(isValidStatusText("a".repeat(30))).toBe(true);
  });

  it("rejects text over 30 characters", () => {
    expect(isValidStatusText("a".repeat(31))).toBe(false);
  });
});
