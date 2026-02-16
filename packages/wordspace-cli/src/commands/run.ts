import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseGitHubUri, toRawUrl, fileName } from "../lib/github-uri.js";
import { httpGet, getAuthHeaders } from "../lib/workflows.js";
import {
  HARNESSES,
  detectInstalled,
  spawnHarness,
  type Harness,
} from "../lib/harness.js";
import { pickOne } from "../lib/prompt.js";
import { ensureInit } from "../steps/auto-init.js";
import * as log from "../lib/log.js";

/**
 * Build the prompt string for a given harness.
 *
 * Skill-native harnesses (Claude Code) get the short `/open-prose run <path>` command.
 * All others receive the .prose file content inline with execution instructions.
 */
function buildPrompt(harness: Harness, prosePath: string, cwd: string): string {
  if (harness.skillNative) {
    return `/open-prose run ${prosePath}`;
  }

  const fullPath = join(cwd, prosePath);
  const content = readFileSync(fullPath, "utf-8");

  return [
    `You are executing a wordspace workflow defined in the file "${prosePath}".`,
    `Follow the steps below exactly. Write all output files to the "output/" directory.`,
    "",
    "--- BEGIN WORKFLOW ---",
    content,
    "--- END WORKFLOW ---",
  ].join("\n");
}

export async function run(target: string | undefined, force: boolean, harnessArg?: string) {
  if (!target) {
    log.error("Usage: wordspace run <github:owner/repo/path.prose | local-path>");
    process.exit(1);
  }

  // --- Harness selection ---
  let harness: Harness;

  if (harnessArg) {
    const match = HARNESSES.find(
      (h) => h.bin === harnessArg || h.name.toLowerCase() === harnessArg.toLowerCase(),
    );
    if (!match) {
      log.error(`Unknown harness: ${harnessArg}`);
      log.info("Available harnesses:");
      for (const h of HARNESSES) {
        log.info(`  ${h.bin.padEnd(14)} ${h.name}`);
      }
      process.exit(1);
    }
    // Verify it's installed
    const installed = detectInstalled();
    if (!installed.some((h) => h.bin === match.bin)) {
      log.error(`${match.name} is not installed.`);
      log.info(`Install it: ${match.installUrl}`);
      process.exit(1);
    }
    harness = match;
  } else {
    const installed = detectInstalled();

    if (installed.length === 0) {
      log.error("No supported coding agent found.");
      log.info("Install one of the following:");
      for (const h of HARNESSES) {
        log.info(`  ${h.name} → ${h.installUrl}`);
      }
      process.exit(1);
    } else if (installed.length === 1) {
      harness = installed[0];
    } else {
      log.step("Pick a coding agent");
      harness = await pickOne(
        installed,
        (h) => h.mode === "headless" ? `${h.name} (headless)` : h.name,
        "Select harness",
      );
    }
  }

  log.success(`Using ${harness.name}`);

  if (harness.mode === "headless") {
    log.warn("Headless mode — the agent will execute and exit without interaction.");
  }

  const cwd = process.cwd();

  // Auto-init if needed (harness-aware)
  ensureInit(cwd, harness);

  let prosePath: string;

  if (target.startsWith("github:")) {
    // Remote: download from GitHub
    const ref = parseGitHubUri(target);
    const name = fileName(ref);
    const workflowsDir = join(cwd, "workflows");
    const dest = join(workflowsDir, name);

    if (existsSync(dest) && !force) {
      log.skip(`${name} (cached)`);
    } else {
      const url = toRawUrl(ref);
      log.info(`Fetching ${name}...`);
      const headers = getAuthHeaders();
      const content = await httpGet(url, headers);
      mkdirSync(workflowsDir, { recursive: true });
      writeFileSync(dest, content, "utf-8");
      log.success(`Downloaded ${name}`);
    }

    prosePath = `workflows/${name}`;
  } else {
    // Local path
    if (!existsSync(target)) {
      log.error(`File not found: ${target}`);
      process.exit(1);
    }
    prosePath = target;
  }

  const prompt = buildPrompt(harness, prosePath, cwd);

  console.log();
  if (harness.skillNative) {
    log.info(prompt);
  } else {
    log.info(`Running ${prosePath} via ${harness.name}...`);
  }
  console.log();

  const exitCode = spawnHarness(harness, prompt, cwd);
  process.exit(exitCode);
}
