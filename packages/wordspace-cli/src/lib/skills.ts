import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface SkillInfo {
  name: string;
  path: string;
}

export interface SkillDiscoveryResult {
  dir: string;
  skills: SkillInfo[];
}

/**
 * Discover installed skills by checking directories in priority order:
 * 1. customDir (if --skills-dir provided)
 * 2. <cwd>/.agents/skills/
 * 3. ~/.agents/skills/ (home dir global)
 *
 * Returns the first directory that contains at least the open-prose skill.
 * Lists all skills found in that directory (each subdirectory with a SKILL.md).
 */
export function discoverSkills(
  cwd: string,
  customDir?: string,
): SkillDiscoveryResult | null {
  const candidates: string[] = [];

  if (customDir) candidates.push(customDir);
  candidates.push(join(cwd, ".agents", "skills"));
  candidates.push(join(homedir(), ".agents", "skills"));

  for (const dir of candidates) {
    if (!existsSync(dir)) continue;

    const hasOpenProse = existsSync(join(dir, "open-prose"));
    if (!hasOpenProse) continue;

    const skills: SkillInfo[] = [];
    for (const entry of readdirSync(dir)) {
      const entryPath = join(dir, entry);
      if (!statSync(entryPath).isDirectory()) continue;
      if (existsSync(join(entryPath, "SKILL.md"))) {
        skills.push({ name: entry, path: entryPath });
      }
    }

    if (skills.length > 0) {
      return { dir, skills };
    }
  }

  return null;
}

/** Check whether the required skills are installed in a given directory. */
export function hasRequiredSkills(dir: string): boolean {
  const required = ["open-prose", "agentwallet", "registry", "wordspace"];
  return required.every((s) => existsSync(join(dir, s)));
}
