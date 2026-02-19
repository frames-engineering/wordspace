import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { setupClaude } from "./setup-claude.js";
import { createDirs } from "./create-dirs.js";
import type { Harness } from "../lib/harness.js";
import { discoverSkills, hasRequiredSkills } from "../lib/skills.js";
import * as log from "../lib/log.js";

const SKILL_PACKAGES = [
  "frames-engineering/skills",
  "frames-engineering/wordspace",
];

function installSkills(cwd: string) {
  for (const pkg of SKILL_PACKAGES) {
    try {
      execSync(`npx -y skills add ${pkg} --all`, {
        cwd,
        stdio: "inherit",
      });
    } catch {
      log.warn(`Could not install skills from ${pkg}`);
    }
  }
}

/** Silently initialize the project if not already done. */
export function ensureInit(cwd: string, harness: Harness, customSkillsDir?: string) {
  const isClaude = harness.bin === "claude";

  const hasSettings = isClaude
    ? existsSync(join(cwd, ".claude", "settings.local.json"))
    : true; // non-Claude harnesses don't need Claude settings
  const hasOutput = existsSync(join(cwd, "output"));

  const discovery = discoverSkills(cwd, customSkillsDir);
  const hasSkills = discovery !== null && hasRequiredSkills(discovery.dir);

  if (hasSettings && hasOutput && hasSkills) return;

  log.info("Auto-initializing project...");
  if (!hasOutput) {
    createDirs(cwd);
  }
  if (isClaude && !hasSettings) {
    setupClaude(cwd);
  }
  if (!hasSkills) {
    installSkills(cwd);
  }
}
