const noColor = !!process.env["NO_COLOR"];

const code = (n: number) => (noColor ? "" : `\x1b[${n}m`);
const reset = code(0);
const bold = code(1);
const dim = code(2);
const green = code(32);
const yellow = code(33);
const red = code(31);
const cyan = code(36);

export function info(msg: string) {
  console.log(`${cyan}i${reset} ${msg}`);
}

export function success(msg: string) {
  console.log(`${green}✓${reset} ${msg}`);
}

export function warn(msg: string) {
  console.log(`${yellow}!${reset} ${msg}`);
}

export function error(msg: string) {
  console.error(`${red}✗${reset} ${msg}`);
}

export function step(msg: string) {
  console.log(`\n${bold}${msg}${reset}`);
}

export function skip(msg: string) {
  console.log(`${dim}–${reset} ${dim}${msg}${reset}`);
}

export function banner() {
  console.log(`\n${bold}wordspace init${reset}\n`);
}
