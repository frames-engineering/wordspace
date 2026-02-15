#!/usr/bin/env node

import { init } from "./commands/init.js";
import { search } from "./commands/search.js";
import { add } from "./commands/add.js";
import { run } from "./commands/run.js";
import * as log from "./lib/log.js";

const VERSION = "0.0.9";

const HELP = `
Usage: wordspace <command> [options]

Commands:
  init          Bootstrap a new wordspace project
  search [q]    List available workflows (optionally filter by query)
  add <name>    Download specific workflow(s) by name
  run <target>  Run a .prose workflow via Claude Code

Options:
  --force       Re-run all steps / overwrite existing files
  --help        Show this help message
  --version     Show version number
`.trim();

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    process.exit(0);
  }

  const positional = args.filter((a) => !a.startsWith("-"));
  const command = positional[0];
  const force = args.includes("--force");

  if (command === "init") {
    await init(force);
  } else if (command === "search") {
    await search(positional[1]);
  } else if (command === "add") {
    await add(positional.slice(1), force);
  } else if (command === "run") {
    await run(positional[1], force);
  } else if (!command) {
    console.log(HELP);
    process.exit(0);
  } else {
    log.error(`Unknown command: ${command}`);
    console.log(HELP);
    process.exit(1);
  }
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
