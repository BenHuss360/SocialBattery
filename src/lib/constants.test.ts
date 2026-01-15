import { describe, it, expect } from "vitest";
import { STATUS_PRESETS, STATUS_PRESETS_MAP } from "./constants";

describe("STATUS_PRESETS", () => {
  it("should have unique values", () => {
    const values = STATUS_PRESETS.map((p) => p.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it("should have non-empty labels", () => {
    STATUS_PRESETS.forEach((preset) => {
      expect(preset.label.length).toBeGreaterThan(0);
    });
  });

  it("should have snake_case values", () => {
    STATUS_PRESETS.forEach((preset) => {
      expect(preset.value).toMatch(/^[a-z]+(_[a-z]+)*$/);
    });
  });
});

describe("STATUS_PRESETS_MAP", () => {
  it("should map all preset values to labels", () => {
    STATUS_PRESETS.forEach((preset) => {
      expect(STATUS_PRESETS_MAP[preset.value]).toBe(preset.label);
    });
  });

  it("should return undefined for unknown values", () => {
    expect(STATUS_PRESETS_MAP["unknown_value"]).toBeUndefined();
  });
});
