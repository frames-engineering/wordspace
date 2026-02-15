import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as log from "../lib/log.js";
import { listWorkflows, downloadWorkflow } from "../lib/workflows.js";

export async function add(names: string[], force: boolean) {
  if (names.length === 0) {
    log.error("Specify at least one workflow name. Run `wordspace search` to browse.");
    process.exit(1);
  }

  let available;
  try {
    available = await listWorkflows();
  } catch (err) {
    log.error(`Could not fetch workflows: ${(err as Error).message}`);
    process.exit(1);
  }

  const workflowsDir = join(process.cwd(), "workflows");
  mkdirSync(workflowsDir, { recursive: true });

  let downloaded = 0;
  for (const raw of names) {
    const name = raw.endsWith(".prose") ? raw : `${raw}.prose`;
    const entry = available.find((w) => w.name === name);
    if (!entry) {
      log.warn(`Workflow not found: ${name}`);
      continue;
    }
    try {
      const ok = await downloadWorkflow(entry, workflowsDir, force);
      if (ok) downloaded++;
    } catch (err) {
      log.warn(`Failed to download ${name}: ${(err as Error).message}`);
    }
  }

  if (downloaded > 0) {
    log.success(`Downloaded ${downloaded} workflow(s) to workflows/`);
  }
}
