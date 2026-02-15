import { execSync } from "node:child_process";
import * as log from "./log.js";

export interface ExecOptions {
  cwd?: string;
  timeout?: number;
  silent?: boolean;
}

export function exec(
  cmd: string,
  opts: ExecOptions = {},
): string {
  const { cwd = process.cwd(), timeout = 60_000, silent = false } = opts;
  try {
    const result = execSync(cmd, {
      cwd,
      timeout,
      stdio: silent ? "pipe" : ["pipe", "pipe", "pipe"],
      encoding: "utf-8",
    });
    return result.trim();
  } catch (err: unknown) {
    const e = err as { stderr?: string; message?: string };
    const msg = e.stderr?.trim() || e.message || "Command failed";
    log.error(`Command failed: ${cmd}`);
    log.error(msg);
    throw new Error(`exec failed: ${cmd}`);
  }
}
