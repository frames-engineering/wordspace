import { get as httpsGet } from "node:https";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import * as log from "./log.js";

const CONTENTS_URL =
  "https://api.github.com/repos/frames-engineering/wordspace/contents/workflows";

export interface WorkflowEntry {
  name: string;
  download_url: string;
}

export function httpGet(
  url: string,
  headers: Record<string, string> = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const allHeaders: Record<string, string> = {
      "User-Agent": "wordspace-cli",
      ...headers,
    };
    httpsGet(url, { headers: allHeaders }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        httpGet(res.headers.location, headers).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = "";
      res.on("data", (chunk: Buffer) => (data += chunk.toString()));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

export function getAuthHeaders(): Record<string, string> {
  const token = process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"];
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/** Fetch the list of .prose workflow files available on GitHub. */
export async function listWorkflows(): Promise<WorkflowEntry[]> {
  const headers = getAuthHeaders();
  const body = await httpGet(CONTENTS_URL, headers);
  const entries = JSON.parse(body) as WorkflowEntry[];
  return entries.filter((e) => e.name.endsWith(".prose"));
}

/** Download a single workflow file into the target directory. */
export async function downloadWorkflow(
  entry: WorkflowEntry,
  workflowsDir: string,
  force: boolean,
): Promise<boolean> {
  const dest = join(workflowsDir, entry.name);
  if (existsSync(dest) && !force) {
    log.skip(`${entry.name} (exists)`);
    return false;
  }
  const headers = getAuthHeaders();
  const content = await httpGet(entry.download_url, headers);
  mkdirSync(workflowsDir, { recursive: true });
  writeFileSync(dest, content, "utf-8");
  log.success(entry.name);
  return true;
}
