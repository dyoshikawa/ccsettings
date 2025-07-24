export interface CliOptions {
  githubToken?: string;
  output?: string;
  since?: string;
  until?: string;
  visibility?: "public" | "private" | "all";
  maxLength?: number | string;
  order?: "asc" | "desc";
}

export interface ParsedCliOptions {
  githubToken: string;
  output: string;
  since: Date;
  until: Date;
  visibility: "public" | "private" | "all";
  maxLength: number;
  order: "asc" | "desc";
}
