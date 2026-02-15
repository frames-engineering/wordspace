import { createInterface } from "node:readline";

/**
 * Prompt the user to pick items from a numbered list.
 *
 * Accepts: "all", "none", comma-separated numbers, ranges ("1-3"),
 * or a mix ("1,3-5,7").
 *
 * In non-TTY environments (CI), auto-selects all items.
 */
export async function pickMany<T>(
  items: T[],
  label: (item: T, index: number) => string,
  prompt: string,
): Promise<T[]> {
  if (items.length === 0) return [];

  // Non-TTY: auto-select all
  if (!process.stdin.isTTY) {
    return items;
  }

  // Print numbered list
  for (let i = 0; i < items.length; i++) {
    console.log(`  ${String(i + 1).padStart(2)}  ${label(items[i], i)}`);
  }
  console.log();

  const answer = await ask(`${prompt} [all/none/1,2,3/1-3]: `);
  return parseSelection(answer, items);
}

function ask(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function parseSelection<T>(input: string, items: T[]): T[] {
  const lower = input.toLowerCase();
  if (lower === "all" || lower === "") return items;
  if (lower === "none" || lower === "0") return [];

  const indices = new Set<number>();
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= items.length) indices.add(i - 1);
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n) && n >= 1 && n <= items.length) indices.add(n - 1);
    }
  }

  return [...indices].sort((a, b) => a - b).map((i) => items[i]);
}
