import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { parseGitHubUri, toRawUrl, fileName } from "../lib/github-uri.js";
import { httpGet, getAuthHeaders } from "../lib/workflows.js";
import { isClaudeInstalled, spawnClaude } from "../lib/spawn.js";
import { ensureInit } from "../steps/auto-init.js";
import * as log from "../lib/log.js";

export async function run(target: string | undefined, force: boolean) {
  if (!target) {
    log.error("Usage: wordspace run <github:owner/repo/path.prose | local-path>");
    process.exit(1);
  }

  if (!isClaudeInstalled()) {
    log.error("claude CLI not found. Install Claude Code first: https://claude.ai/code");
    process.exit(1);
  }

  const cwd = process.cwd();

  // Auto-init if needed
  ensureInit(cwd);

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

  const prompt = `/open-prose run ${prosePath}`;
  console.log();
  log.info(prompt);
  console.log();

  const exitCode = spawnClaude(prompt, cwd);
  process.exit(exitCode);
}
