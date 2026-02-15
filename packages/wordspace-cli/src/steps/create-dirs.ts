import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as log from "../lib/log.js";

export function createDirs(cwd: string) {
  mkdirSync(join(cwd, "output"), { recursive: true });
  log.success("Created output/ directory");
}
