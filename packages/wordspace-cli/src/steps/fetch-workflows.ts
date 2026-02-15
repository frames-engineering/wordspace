import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import * as log from "../lib/log.js";
import { listWorkflows, downloadWorkflow, type WorkflowEntry } from "../lib/workflows.js";
import { pickMany } from "../lib/prompt.js";

export async function fetchWorkflows(cwd: string, force: boolean) {
  const workflowsDir = join(cwd, "workflows");
  mkdirSync(workflowsDir, { recursive: true });

  let available: WorkflowEntry[];
  try {
    available = await listWorkflows();
  } catch (err) {
    log.warn(
      `Could not fetch workflow list from GitHub: ${(err as Error).message}`,
    );
    log.warn("Skipping workflow download (skills are the critical part).");
    return;
  }

  if (available.length === 0) {
    log.warn("No .prose files found in remote repository");
    return;
  }

  // Filter out already-installed unless --force
  const candidates = force
    ? available
    : available.filter((e) => !existsSync(join(workflowsDir, e.name)));

  if (candidates.length === 0) {
    log.skip("All workflows already present");
    return;
  }

  log.info(`${available.length} workflow(s) available, ${candidates.length} new:`);

  const selected = await pickMany(
    candidates,
    (w) => w.name.replace(/\.prose$/, ""),
    "Which workflows do you want?",
  );

  if (selected.length === 0) {
    log.skip("No workflows selected");
    return;
  }

  let downloaded = 0;
  for (const entry of selected) {
    try {
      const ok = await downloadWorkflow(entry, workflowsDir, force);
      if (ok) downloaded++;
    } catch (err) {
      log.warn(`Failed to download ${entry.name}: ${(err as Error).message}`);
    }
  }

  if (downloaded > 0) {
    log.success(`Downloaded ${downloaded} workflow(s) to workflows/`);
  }
}
