#!/usr/bin/env node

import { Command } from "commander";
import { GitHubService } from "../services/github.js";
import type { CliOptions } from "../types/index.js";
import { FileSplitter } from "../utils/file-splitter.js";
import { XmlGenerator } from "../utils/xml.js";
import { ProgressDisplay } from "./ui/progress.jsx";
import { parseCliOptions } from "./utils/options.js";
import { validateOptions } from "./utils/validation.js";

const program = new Command();

program
  .name("ghevents")
  .description("CLI tool to fetch GitHub events and export to XML")
  .version("0.1.0")
  .option("-t, --github-token <token>", "GitHub access token")
  .option("-o, --output <file>", "Output file name", "./ghevents.xml")
  .option("-s, --since <date>", "Start date in ISO8601 format")
  .option("-u, --until <date>", "End date in ISO8601 format")
  .option("-v, --visibility <type>", "Repository visibility: public, private, all", "public")
  .option("-m, --max-length <number>", "Maximum XML file length", "500000")
  .option("-r, --order <order>", "Event order: asc, desc", "asc")
  .action(async (options: CliOptions) => {
    try {
      const parsedOptions = await parseCliOptions(options);
      validateOptions(parsedOptions);

      const progress = new ProgressDisplay();
      progress.start();

      const githubService = new GitHubService(parsedOptions.githubToken);
      const events = await githubService.fetchEvents(parsedOptions, progress);

      const xmlGenerator = new XmlGenerator();
      const xmlContent = xmlGenerator.generate(events, parsedOptions.order);

      const fileSplitter = new FileSplitter(parsedOptions.maxLength);
      await fileSplitter.writeFiles(xmlContent, parsedOptions.output);

      progress.complete();
      console.log(`Successfully exported ${events.length} events to ${parsedOptions.output}`);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : "Unknown error");
      process.exit(1);
    }
  });

program.parseAsync(process.argv).catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
