import { spawnSync, execSync } from "node:child_process";

/** Check if `claude` CLI is available on PATH. */
export function isClaudeInstalled(): boolean {
  try {
    execSync("which claude", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/** Spawn `claude` interactively, handing over the terminal. */
export function spawnClaude(prompt: string, cwd: string): number {
  const result = spawnSync("claude", [prompt], {
    cwd,
    stdio: "inherit",
  });
  return result.status ?? 1;
}
