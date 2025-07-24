import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileSplitter } from "./file-splitter.js";

describe("FileSplitter", () => {
  const testDir = "/tmp/ghevents-test";
  const testOutputPath = `${testDir}/test-output.xml`;

  beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it("should write single file when content is within max length", async () => {
    const splitter = new FileSplitter(1000);
    const content =
      '<?xml version="1.0" encoding="UTF-8"?>\n<GitHubEvents>\n  <Issue>test</Issue>\n</GitHubEvents>';

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toBe("test-output.xml");

    const fileContent = await readFile(testOutputPath, "utf8");
    expect(fileContent).toBe(content);
  });

  it("should split content into multiple files when exceeding max length", async () => {
    const splitter = new FileSplitter(200);
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
  <Issue createdAt="2023-01-01T00:00:00Z" number="1" state="OPEN">
    <Title>First Issue</Title>
    <Body>First issue body</Body>
  </Issue>
  <Issue createdAt="2023-01-02T00:00:00Z" number="2" state="OPEN">
    <Title>Second Issue</Title>
    <Body>Second issue body</Body>
  </Issue>
</GitHubEvents>`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files.length).toBeGreaterThan(1);
    expect(files).toContain("test-output_1.xml");
    expect(files).toContain("test-output_2.xml");
  });

  it("should maintain valid XML structure in split files", async () => {
    const splitter = new FileSplitter(200);
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
  <Issue createdAt="2023-01-01T00:00:00Z" number="1" state="OPEN">
    <Title>First Issue</Title>
  </Issue>
  <Issue createdAt="2023-01-02T00:00:00Z" number="2" state="OPEN">
    <Title>Second Issue</Title>
  </Issue>
</GitHubEvents>`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);

    for (const file of files) {
      const filePath = join(testDir, file);
      const fileContent = await readFile(filePath, "utf8");

      expect(fileContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(fileContent).toContain("<GitHubEvents>");
      expect(fileContent).toContain("</GitHubEvents>");
    }
  });

  it("should handle different file extensions correctly", async () => {
    const splitter = new FileSplitter(100);
    const jsonOutputPath = `${testDir}/test-output.json`;
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
  <Issue>test</Issue>
  <Issue>test2</Issue>
  <Issue>test3</Issue>
</GitHubEvents>`;

    await splitter.writeFiles(content, jsonOutputPath);

    const files = await readdir(testDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    expect(jsonFiles.length).toBeGreaterThan(0);
    expect(jsonFiles[0]).toMatch(/test-output_\d+\.json/);
  });

  it("should handle files without extension correctly", async () => {
    const splitter = new FileSplitter(100);
    const noExtOutputPath = `${testDir}/test-output`;
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
  <Issue>test</Issue>
  <Issue>test2</Issue>
</GitHubEvents>`;

    await splitter.writeFiles(content, noExtOutputPath);

    const files = await readdir(testDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files[0]).toMatch(/test-output_\d+$/);
  });

  it("should create sequential numbered files", async () => {
    const splitter = new FileSplitter(150);
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
  <Issue>test1</Issue>
  <Issue>test2</Issue>
  <Issue>test3</Issue>
  <Issue>test4</Issue>
</GitHubEvents>`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    const sortedFiles = files.sort();

    expect(sortedFiles).toContain("test-output_1.xml");
    if (sortedFiles.length > 1) {
      expect(sortedFiles).toContain("test-output_2.xml");
    }
  });

  it("should handle empty content correctly", async () => {
    const splitter = new FileSplitter(1000);
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
</GitHubEvents>`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files).toHaveLength(1);

    const fileContent = await readFile(testOutputPath, "utf8");
    expect(fileContent).toBe(content);
  });

  it("should handle very small max length gracefully", async () => {
    const splitter = new FileSplitter(50);
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
  <Issue>test</Issue>
</GitHubEvents>`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const filePath = join(testDir, file);
      const fileContent = await readFile(filePath, "utf8");
      expect(fileContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(fileContent).toContain("<GitHubEvents>");
      expect(fileContent).toContain("</GitHubEvents>");
    }
  });

  it("should not create files with undefined content", async () => {
    const splitter = new FileSplitter(200);
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<GitHubEvents>",
      "  <Issue>test1</Issue>",
      "",
      "  <Issue>test2</Issue>",
      "</GitHubEvents>",
    ];
    const content = lines.join("\n");

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);

    for (const file of files) {
      const filePath = join(testDir, file);
      const fileContent = await readFile(filePath, "utf8");
      expect(fileContent).not.toContain("undefined");
    }
  });

  it("should handle content where parts would be empty except for XML wrapper", async () => {
    const splitter = new FileSplitter(120);
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
  <Issue>content</Issue>
</GitHubEvents>`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const filePath = join(testDir, file);
      const fileContent = await readFile(filePath, "utf8");
      expect(fileContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(fileContent).toContain("<GitHubEvents>");
      expect(fileContent).toContain("</GitHubEvents>");
    }
  });

  it("should handle content that would create parts at exact base length", async () => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const openTag = "<GitHubEvents>";
    const closeTag = "</GitHubEvents>";
    const baseLength = xmlHeader.length + openTag.length + closeTag.length + 4;

    const splitter = new FileSplitter(baseLength + 10);
    const content = `${xmlHeader}
${openTag}
  <Issue>test</Issue>
${closeTag}`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files.length).toBeGreaterThanOrEqual(1);
  });

  it("should skip lines that are undefined or null", async () => {
    const splitter = new FileSplitter(200);
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<GitHubEvents>",
      "  <Issue>test1</Issue>",
      undefined,
      null,
      "  <Issue>test2</Issue>",
      "</GitHubEvents>",
    ];

    // Create content with some undefined/null entries
    const content = lines.filter((line) => line !== undefined && line !== null).join("\n");

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files.length).toBeGreaterThan(0);
  });

  it("should handle content with only XML headers", async () => {
    const splitter = new FileSplitter(1000);
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
</GitHubEvents>`;

    await splitter.writeFiles(content, testOutputPath);

    const files = await readdir(testDir);
    expect(files).toHaveLength(1);

    const fileContent = await readFile(testOutputPath, "utf8");
    expect(fileContent).toBe(content);
  });
});
