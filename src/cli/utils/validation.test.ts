import { describe, expect, it } from "vitest";
import type { ParsedCliOptions } from "../../types/index.js";
import { validateOptions } from "./validation.js";

const createValidOptions = (): ParsedCliOptions => ({
  githubToken: "valid-token",
  output: "./test.xml",
  since: new Date("2023-01-01T00:00:00Z"),
  until: new Date("2023-01-31T23:59:59Z"),
  visibility: "public",
  maxLength: 500000,
  order: "asc",
});

describe("validateOptions", () => {
  it("should pass validation with valid options", () => {
    const options = createValidOptions();
    expect(() => validateOptions(options)).not.toThrow();
  });

  it("should throw error when github token is missing", () => {
    const options = createValidOptions();
    options.githubToken = "";

    expect(() => validateOptions(options)).toThrow("GitHub token is required");
  });

  it("should throw error when github token is undefined", () => {
    const options = createValidOptions();
    (options as any).githubToken = undefined;

    expect(() => validateOptions(options)).toThrow("GitHub token is required");
  });

  it("should throw error when since date is invalid", () => {
    const options = createValidOptions();
    options.since = new Date("invalid-date");

    expect(() => validateOptions(options)).toThrow(
      "Invalid --since date format. Use ISO8601 format (e.g., 2023-01-01T00:00:00Z)",
    );
  });

  it("should throw error when until date is invalid", () => {
    const options = createValidOptions();
    options.until = new Date("invalid-date");

    expect(() => validateOptions(options)).toThrow(
      "Invalid --until date format. Use ISO8601 format (e.g., 2023-01-01T00:00:00Z)",
    );
  });

  it("should throw error when since date is after until date", () => {
    const options = createValidOptions();
    options.since = new Date("2023-01-31T00:00:00Z");
    options.until = new Date("2023-01-01T00:00:00Z");

    expect(() => validateOptions(options)).toThrow("--since date must be before --until date");
  });

  it("should throw error when since date equals until date", () => {
    const options = createValidOptions();
    const sameDate = new Date("2023-01-15T12:00:00Z");
    options.since = sameDate;
    options.until = sameDate;

    expect(() => validateOptions(options)).toThrow("--since date must be before --until date");
  });

  it("should throw error for invalid visibility value", () => {
    const options = createValidOptions();
    (options as any).visibility = "invalid";

    expect(() => validateOptions(options)).toThrow(
      "--visibility must be one of: public, private, all",
    );
  });

  it("should accept all valid visibility values", () => {
    const options = createValidOptions();

    options.visibility = "public";
    expect(() => validateOptions(options)).not.toThrow();

    options.visibility = "private";
    expect(() => validateOptions(options)).not.toThrow();

    options.visibility = "all";
    expect(() => validateOptions(options)).not.toThrow();
  });

  it("should throw error when maxLength is zero", () => {
    const options = createValidOptions();
    options.maxLength = 0;

    expect(() => validateOptions(options)).toThrow("--max-length must be a positive number");
  });

  it("should throw error when maxLength is negative", () => {
    const options = createValidOptions();
    options.maxLength = -1000;

    expect(() => validateOptions(options)).toThrow("--max-length must be a positive number");
  });

  it("should accept positive maxLength values", () => {
    const options = createValidOptions();

    options.maxLength = 1;
    expect(() => validateOptions(options)).not.toThrow();

    options.maxLength = 1000000;
    expect(() => validateOptions(options)).not.toThrow();
  });

  it("should throw error for invalid order value", () => {
    const options = createValidOptions();
    (options as any).order = "invalid";

    expect(() => validateOptions(options)).toThrow("--order must be one of: asc, desc");
  });

  it("should accept both valid order values", () => {
    const options = createValidOptions();

    options.order = "asc";
    expect(() => validateOptions(options)).not.toThrow();

    options.order = "desc";
    expect(() => validateOptions(options)).not.toThrow();
  });

  it("should validate edge case dates correctly", () => {
    const options = createValidOptions();

    // Very close dates (1 millisecond apart)
    options.since = new Date("2023-01-01T00:00:00.000Z");
    options.until = new Date("2023-01-01T00:00:00.001Z");
    expect(() => validateOptions(options)).not.toThrow();
  });

  it("should handle all validation errors in sequence", () => {
    const options: ParsedCliOptions = {
      githubToken: "",
      output: "./test.xml",
      since: new Date("invalid"),
      until: new Date("2023-01-01T00:00:00Z"),
      visibility: "public",
      maxLength: 500000,
      order: "asc",
    };

    // Should throw the first error encountered (GitHub token)
    expect(() => validateOptions(options)).toThrow("GitHub token is required");
  });

  it("should validate properly with minimal valid configuration", () => {
    const options: ParsedCliOptions = {
      githubToken: "token",
      output: "./output.xml",
      since: new Date("2023-01-01T00:00:00Z"),
      until: new Date("2023-01-02T00:00:00Z"),
      visibility: "public",
      maxLength: 1,
      order: "asc",
    };

    expect(() => validateOptions(options)).not.toThrow();
  });

  it("should validate boundary values correctly", () => {
    const options = createValidOptions();

    // Test maxLength = 1 (minimum valid value)
    options.maxLength = 1;
    expect(() => validateOptions(options)).not.toThrow();

    // Test very large maxLength
    options.maxLength = Number.MAX_SAFE_INTEGER;
    expect(() => validateOptions(options)).not.toThrow();
  });
});
