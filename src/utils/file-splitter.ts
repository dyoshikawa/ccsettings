import { writeFile } from "node:fs/promises";
import { basename, dirname, extname } from "node:path";

export class FileSplitter {
  constructor(private maxLength: number) {}

  async writeFiles(content: string, outputPath: string): Promise<void> {
    if (content.length <= this.maxLength) {
      await writeFile(outputPath, content, "utf8");
      return;
    }

    const parts = this.splitContent(content);
    const dir = dirname(outputPath);
    const ext = extname(outputPath);
    const name = basename(outputPath, ext);

    for (let i = 0; i < parts.length; i++) {
      const partPath = `${dir}/${name}_${i + 1}${ext}`;
      const part = parts[i];
      if (part) {
        await writeFile(partPath, part, "utf8");
      }
    }
  }

  private splitContent(content: string): string[] {
    const parts: string[] = [];
    const lines = content.split("\n");

    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const openTag = "<GitHubEvents>";
    const closeTag = "</GitHubEvents>";

    const baseLength = xmlHeader.length + openTag.length + closeTag.length + 4; // +4 for newlines
    let currentPart = `${xmlHeader}\n${openTag}\n`;
    let currentLength = baseLength;

    for (let i = 2; i < lines.length - 1; i++) {
      // Skip header and root tags
      const line = lines[i];
      if (!line) continue;
      const lineLength = line.length + 1; // +1 for newline

      if (
        currentLength + lineLength > this.maxLength &&
        currentPart.trim() !== `${xmlHeader}\n${openTag}`
      ) {
        // Close current part and start new one
        currentPart += `\n${closeTag}`;
        parts.push(currentPart);

        currentPart = `${xmlHeader}\n${openTag}\n`;
        currentLength = baseLength;
      }

      currentPart += line + "\n";
      currentLength += lineLength;
    }

    // Close the last part
    currentPart += closeTag;
    parts.push(currentPart);

    return parts;
  }
}
