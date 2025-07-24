import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CliOptions } from "../../types/index.js";
import { parseCliOptions } from "./options.js";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

describe("parseCliOptions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should use default values when no options provided", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const options: CliOptions = {};
    const result = await parseCliOptions(options);

    expect(result.githubToken).toBe("test-token");
    expect(result.output).toBe("./ghevents.xml");
    expect(result.visibility).toBe("public");
    expect(result.maxLength).toBe(500000);
    expect(result.order).toBe("asc");
    expect(result.since).toBeInstanceOf(Date);
    expect(result.until).toBeInstanceOf(Date);
  });

  it("should use provided options over defaults", async () => {
    const customSince = "2023-01-01T00:00:00Z";
    const customUntil = "2023-01-31T23:59:59Z";

    const options: CliOptions = {
      githubToken: "custom-token",
      output: "./custom-output.xml",
      since: customSince,
      until: customUntil,
      visibility: "private",
      maxLength: "1000000",
      order: "desc",
    };

    const result = await parseCliOptions(options);

    expect(result.githubToken).toBe("custom-token");
    expect(result.output).toBe("./custom-output.xml");
    expect(result.visibility).toBe("private");
    expect(result.maxLength).toBe(1000000);
    expect(result.order).toBe("desc");
    expect(result.since).toEqual(new Date(customSince));
    expect(result.until).toEqual(new Date(customUntil));
  });

  it("should set default date range to last 2 weeks", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const beforeTest = Date.now();
    const options: CliOptions = {};
    const result = await parseCliOptions(options);
    const afterTest = Date.now();

    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const sinceTime = result.since.getTime();
    const untilTime = result.until.getTime();

    expect(untilTime - sinceTime).toBeCloseTo(twoWeeksInMs, -5);
    expect(untilTime).toBeGreaterThanOrEqual(beforeTest);
    expect(untilTime).toBeLessThanOrEqual(afterTest);
  });

  it("should parse maxLength as integer", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const options: CliOptions = {
      maxLength: "750000",
    };

    const result = await parseCliOptions(options);
    expect(result.maxLength).toBe(750000);
    expect(typeof result.maxLength).toBe("number");
  });

  it("should handle maxLength as number", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const options: CliOptions = {
      maxLength: 250000,
    };

    const result = await parseCliOptions(options);
    expect(result.maxLength).toBe(250000);
  });

  it("should get token from environment variable", async () => {
    process.env.GITHUB_TOKEN = "env-token";

    const options: CliOptions = {};
    const result = await parseCliOptions(options);

    expect(result.githubToken).toBe("env-token");
  });

  it("should prefer provided token over environment variable", async () => {
    process.env.GITHUB_TOKEN = "env-token";

    const options: CliOptions = {
      githubToken: "provided-token",
    };

    const result = await parseCliOptions(options);
    expect(result.githubToken).toBe("provided-token");
  });

  it("should try gh CLI when no token provided and no env var", async () => {
    delete process.env.GITHUB_TOKEN;

    const { execSync } = await import("node:child_process");
    vi.mocked(execSync).mockReturnValue("gh-cli-token\n");

    const options: CliOptions = {};
    const result = await parseCliOptions(options);

    expect(result.githubToken).toBe("gh-cli-token");
    expect(execSync).toHaveBeenCalledWith("gh auth token", { encoding: "utf8" });
  });

  it("should throw error when no token available", async () => {
    delete process.env.GITHUB_TOKEN;

    const { execSync } = await import("node:child_process");
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error("gh command failed");
    });

    const options: CliOptions = {};

    await expect(parseCliOptions(options)).rejects.toThrow(
      "No GitHub token found. Please provide --github-token, set GITHUB_TOKEN environment variable, or authenticate with gh CLI",
    );
  });

  it("should handle string dates correctly", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const options: CliOptions = {
      since: "2023-06-01T00:00:00Z",
      until: "2023-06-30T23:59:59Z",
    };

    const result = await parseCliOptions(options);

    expect(result.since).toEqual(new Date("2023-06-01T00:00:00Z"));
    expect(result.until).toEqual(new Date("2023-06-30T23:59:59Z"));
  });

  it("should handle all visibility options", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const publicOptions: CliOptions = { visibility: "public" };
    const privateOptions: CliOptions = { visibility: "private" };
    const allOptions: CliOptions = { visibility: "all" };

    const publicResult = await parseCliOptions(publicOptions);
    const privateResult = await parseCliOptions(privateOptions);
    const allResult = await parseCliOptions(allOptions);

    expect(publicResult.visibility).toBe("public");
    expect(privateResult.visibility).toBe("private");
    expect(allResult.visibility).toBe("all");
  });

  it("should handle both order options", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const ascOptions: CliOptions = { order: "asc" };
    const descOptions: CliOptions = { order: "desc" };

    const ascResult = await parseCliOptions(ascOptions);
    const descResult = await parseCliOptions(descOptions);

    expect(ascResult.order).toBe("asc");
    expect(descResult.order).toBe("desc");
  });
});
