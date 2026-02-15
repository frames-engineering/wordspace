import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import * as log from "../lib/log.js";

const BASE_PERMISSIONS = [
  "Bash(curl:*)",
  "Bash(python3:*)",
  "WebFetch(domain:registry.mcpay.tech)",
  "WebFetch(domain:frames.ag)",
  "WebSearch",
];

interface ClaudeSettings {
  permissions?: {
    allow?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function setupClaude(cwd: string) {
  const claudeDir = join(cwd, ".claude");
  mkdirSync(claudeDir, { recursive: true });

  const settingsPath = join(claudeDir, "settings.local.json");

  let settings: ClaudeSettings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
    } catch {
      log.warn("Could not parse existing settings.local.json, creating fresh");
      settings = {};
    }
  }

  if (!settings.permissions) {
    settings.permissions = {};
  }
  if (!Array.isArray(settings.permissions.allow)) {
    settings.permissions.allow = [];
  }

  // Merge base permissions (deduplicate)
  const existing = new Set(settings.permissions.allow);
  let added = 0;
  for (const perm of BASE_PERMISSIONS) {
    if (!existing.has(perm)) {
      settings.permissions.allow.push(perm);
      added++;
    }
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");

  if (added > 0) {
    log.success(`Added ${added} permission(s) to .claude/settings.local.json`);
  } else {
    log.skip("All base permissions already present");
  }
}
