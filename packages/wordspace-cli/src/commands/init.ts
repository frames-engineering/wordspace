import { fetchWorkflows } from "../steps/fetch-workflows.js";
import { setupClaude } from "../steps/setup-claude.js";
import { createDirs } from "../steps/create-dirs.js";
import * as log from "../lib/log.js";

export async function init(force: boolean) {
  const cwd = process.cwd();

  log.banner();

  // Step 1: Fetch workflows
  log.step("1/3 Workflows");
  await fetchWorkflows(cwd, force);

  // Step 2: Setup Claude settings
  log.step("2/3 Claude settings");
  setupClaude(cwd);

  // Step 3: Create directories
  log.step("3/3 Directories");
  createDirs(cwd);

  log.step("Done");
  console.log(`
Your project is ready. Next steps:

  1. Open this directory in your editor
  2. Start Claude Code:  claude
  3. Run a workflow:     prose run workflows/<name>.prose

Browse more workflows:  wordspace search
Add a workflow:         wordspace add <name>
`);
}
