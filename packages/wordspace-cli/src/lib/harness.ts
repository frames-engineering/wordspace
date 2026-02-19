import { spawnSync, execSync } from "node:child_process";

export interface Harness {
  /** Display name shown in the picker. */
  name: string;
  /** Binary name on PATH. */
  bin: string;
  /** Build the CLI args from the prompt string and optional model. */
  args: (prompt: string, model?: string) => string[];
  /** URL or install command the user can use to install this harness. */
  installUrl: string;
  /** Whether the harness runs interactively, headless, or passthrough (already running). */
  mode: "interactive" | "headless" | "passthrough";
  /** Whether the harness natively understands /open-prose skill commands. */
  skillNative: boolean;
}

/** All harnesses wordspace knows about, in display order. */
export const HARNESSES: Harness[] = [
  {
    name: "Claude Code",
    bin: "claude",
    args: (prompt) => [prompt],
    installUrl: "npm i -g @anthropic-ai/claude-code",
    mode: "interactive",
    skillNative: true,
  },
  {
    name: "Codex",
    bin: "codex",
    args: (prompt) => [prompt],
    installUrl: "npm i -g @openai/codex",
    mode: "interactive",
    skillNative: false,
  },
  {
    name: "Gemini CLI",
    bin: "gemini",
    args: (prompt) => [prompt],
    installUrl: "npm i -g @google/gemini-cli",
    mode: "interactive",
    skillNative: false,
  },
  {
    name: "Aider",
    bin: "aider",
    args: (prompt) => ["--message", prompt],
    installUrl: "pip install aider-chat",
    mode: "headless",
    skillNative: false,
  },
  {
    name: "Amp",
    bin: "amp",
    args: (prompt) => [prompt],
    installUrl: "npm i -g @sourcegraph/amp",
    mode: "interactive",
    skillNative: false,
  },
  {
    name: "OpenCode",
    bin: "opencode",
    args: (prompt, model) => [
      "run",
      "--prompt", prompt,
      ...(model ? ["--model", model] : []),
    ],
    installUrl: "https://opencode.ai",
    mode: "headless",
    skillNative: false,
  },
  {
    name: "Goose",
    bin: "goose",
    args: (prompt) => ["run", "-t", prompt],
    installUrl: "brew install block-goose-cli",
    mode: "headless",
    skillNative: false,
  },
  {
    name: "Cline",
    bin: "cline",
    args: (prompt) => [prompt],
    installUrl: "npm i -g cline",
    mode: "interactive",
    skillNative: false,
  },
  {
    name: "Kiro",
    bin: "kiro",
    args: (prompt) => [prompt],
    installUrl: "curl -fsSL https://cli.kiro.dev/install | bash",
    mode: "interactive",
    skillNative: false,
  },
  {
    name: "Cursor Agent",
    bin: "cursor-agent",
    args: (prompt) => ["chat", prompt],
    installUrl: "https://cursor.com",
    mode: "interactive",
    skillNative: false,
  },
  {
    name: "OpenClaw",
    bin: "openclaw",
    args: () => [],
    installUrl: "npm i -g openclaw@latest",
    mode: "passthrough",
    skillNative: false,
  },
];

/** Return only the harnesses whose binary is found on PATH. */
export function detectInstalled(): Harness[] {
  return HARNESSES.filter((h) => {
    try {
      execSync(`which ${h.bin}`, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  });
}

/** Spawn a harness interactively, handing over the terminal. */
export function spawnHarness(
  harness: Harness,
  prompt: string,
  cwd: string,
  model?: string,
): number {
  const result = spawnSync(harness.bin, harness.args(prompt, model), {
    cwd,
    stdio: "inherit",
  });
  return result.status ?? 1;
}
