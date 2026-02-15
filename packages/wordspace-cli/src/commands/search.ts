import * as log from "../lib/log.js";
import { listWorkflows } from "../lib/workflows.js";

export async function search(query?: string) {
  let workflows;
  try {
    workflows = await listWorkflows();
  } catch (err) {
    log.error(`Could not fetch workflows: ${(err as Error).message}`);
    process.exit(1);
  }

  if (query) {
    const lower = query.toLowerCase();
    workflows = workflows.filter((w) =>
      w.name.toLowerCase().includes(lower),
    );
  }

  if (workflows.length === 0) {
    log.info(query ? `No workflows matching "${query}"` : "No workflows found");
    return;
  }

  log.info(`${workflows.length} workflow(s) available${query ? ` matching "${query}"` : ""}:\n`);
  for (const w of workflows) {
    console.log(`  ${w.name.replace(/\.prose$/, "")}`);
  }
  console.log(`\nRun ${`wordspace add <name>`} to download a workflow.`);
}
