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
import { discoverSkills } from "../lib/skills.js";
import * as log from "../lib/log.js";

export interface RunOptions {
  params?: Record<string, string>;
  skillsDir?: string;
  model?: string;
}

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

/**
 * Build a rich passthrough prompt that tells the calling agent where skills
 * are installed, how to use open-prose, and provides workflow params.
 */
function buildPassthroughPrompt(
  prosePath: string,
  cwd: string,
  params?: Record<string, string>,
  skillsDir?: string,
): string {
  const fullPath = join(cwd, prosePath);
  const content = readFileSync(fullPath, "utf-8");

  const discovery = discoverSkills(cwd, skillsDir);
  const lines: string[] = [];

  if (discovery) {
    const skillList = discovery.skills
      .map((s) => `  - ${s.name}`)
      .join("\n");

    lines.push(
      `You have access to the following skills installed at ${discovery.dir}:`,
      skillList,
      "",
      "To execute this workflow:",
      "",
      `1. Read the open-prose skill: ${discovery.dir}/open-prose/SKILL.md`,
      "2. Follow its instructions to load the VM (prose.md) and become the OpenProse interpreter",
      `3. Run the workflow file: ${prosePath}`,
    );
  } else {
    lines.push(
      `You are executing a wordspace workflow defined in the file "${prosePath}".`,
      `Follow the steps below exactly. Write all output files to the "output/" directory.`,
    );
  }

  if (params && Object.keys(params).length > 0) {
    lines.push(
      "",
      "The following input parameters have been provided:",
    );
    for (const [key, value] of Object.entries(params)) {
      lines.push(`  ${key} = "${value}"`);
    }
    lines.push(
      "Use these values for the corresponding `input` declarations in the workflow.",
    );
  }

  lines.push(
    "",
    `--- WORKFLOW: ${prosePath} ---`,
    content,
    "--- END WORKFLOW ---",
  );

  return lines.join("\n");
}

export async function run(target: string | undefined, force: boolean, harnessArg?: string, options?: RunOptions) {
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
        (h) => {
        if (h.mode === "headless") return `${h.name} (headless)`;
        if (h.mode === "passthrough") return `${h.name} (passthrough)`;
        return h.name;
      },
        "Select harness",
      );
    }
  }

  log.success(`Using ${harness.name}`);

  if (harness.mode === "headless") {
    log.warn("Headless mode — the agent will execute and exit without interaction.");
  } else if (harness.mode === "passthrough") {
    log.info("Passthrough mode — outputting workflow for the calling agent.");
  }

  const cwd = process.cwd();

  // Auto-init if needed (harness-aware)
  ensureInit(cwd, harness, options?.skillsDir);

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

  if (harness.mode === "passthrough") {
    const passthroughPrompt = buildPassthroughPrompt(
      prosePath,
      cwd,
      options?.params,
      options?.skillsDir,
    );
    console.log(passthroughPrompt);
    process.exit(0);
  }

  const prompt = buildPrompt(harness, prosePath, cwd);

  console.log();
  if (harness.skillNative) {
    log.info(prompt);
  } else {
    log.info(`Running ${prosePath} via ${harness.name}...`);
  }
  console.log();

  const exitCode = spawnHarness(harness, prompt, cwd, options?.model);
  process.exit(exitCode);
}
