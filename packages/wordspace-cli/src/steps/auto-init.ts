import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { setupClaude } from "./setup-claude.js";
import { createDirs } from "./create-dirs.js";
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
export function ensureInit(cwd: string) {
  const hasSettings = existsSync(join(cwd, ".claude", "settings.local.json"));
  const hasOutput = existsSync(join(cwd, "output"));
  const skillsDir = join(cwd, ".agents", "skills");
  const hasSkills =
    existsSync(join(skillsDir, "open-prose")) &&
    existsSync(join(skillsDir, "agentwallet")) &&
    existsSync(join(skillsDir, "registry")) &&
    existsSync(join(skillsDir, "wordspace"));

  if (hasSettings && hasOutput && hasSkills) return;

  log.info("Auto-initializing project...");
  if (!hasSettings || !hasOutput) {
    setupClaude(cwd);
    createDirs(cwd);
  }
  if (!hasSkills) {
    installSkills(cwd);
  }
}
