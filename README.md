# Wordspace

A CLI for bootstrapping AI agent workspaces with ready-to-run workflows.

Workflows are `.prose` programs that orchestrate multi-agent systems using [OpenProse](https://github.com/openprose/prose), [AgentWallet](https://frames.ag), and the [Frames Registry](https://registry.mcpay.tech).

## Quick Start

```bash
npx wordspace init
```

This will:

1. Show available workflows and let you pick which ones to download
2. Configure Claude Code permissions
3. Create the `output/` directory

Then start Claude Code and run a workflow:

```bash
claude
prose run workflows/x-daily-pulse.prose
```

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- An [AgentWallet](https://frames.ag) account (for paid API workflows)
- Wallet funded with USDC (even $1 covers hundreds of API calls)

## Commands

### `wordspace init`

Bootstrap a new project. Presents an interactive picker to choose which workflows to download.

```bash
npx wordspace init           # interactive setup
npx wordspace init --force   # re-download existing workflows
```

### `wordspace search [query]`

Browse available workflows from the repository.

```bash
npx wordspace search          # list all
npx wordspace search pulse    # filter by keyword
```

### `wordspace add <name>`

Download specific workflows by name.

```bash
npx wordspace add x-daily-pulse
npx wordspace add x-daily-pulse --force   # overwrite existing
```

## Workflows

| File | Description |
|------|-------------|
| [`x-daily-pulse.prose`](workflows/x-daily-pulse.prose) | Multi-agent Twitter/X intelligence briefing. Fetches real tweet data via paid API calls, analyzes engagement, and produces a daily digest with draft replies. |

### Running X Daily Pulse

```bash
prose run workflows/x-daily-pulse.prose
```

You'll be prompted for:
- **accounts** -- X handles to monitor (e.g., `elonmusk, openai`)
- **topics** -- keywords to track (e.g., `AI agents, LLM tooling`)
- **timeframe** -- how far back to look (default: `24h`)
- **goal** -- your engagement goal (e.g., `grow my AI agents audience`)

The workflow spawns four specialized agents (data-fetcher, analyst, engagement-coach, briefing-writer) that fetch live Twitter data, analyze engagement patterns, and produce a markdown briefing saved to `./output/`.

**Cost:** ~$0.10-0.20 per run depending on the number of accounts and topics.

## How It Works

```
                    ┌──────────────┐
                    │  .prose file │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ OpenProse VM │  (Claude becomes the interpreter)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
        │  Agent 1   │ │Agent 2│ │  Agent 3   │  (parallel sub-agents)
        └─────┬──────┘ └───┬───┘ └─────┬──────┘
              │            │            │
        ┌─────▼────────────▼────────────▼─────┐
        │         Frames Registry              │  (pay-per-call APIs)
        │    Twitter · Exa · AI Gen · Test     │
        └─────────────────┬────────────────────┘
                          │
                    ┌─────▼──────┐
                    │AgentWallet │  (x402 micropayments)
                    └────────────┘
```

1. **OpenProse** defines the workflow as a `.prose` program
2. **Claude Code** becomes the VM and spawns parallel agents
3. **Agents** call external APIs through the **Frames Registry**
4. **AgentWallet** handles payments automatically via the x402 protocol
5. Results flow back through the agent pipeline into a final output

## Links

- [OpenProse](https://github.com/openprose/prose) -- the programming language for AI sessions
- [AgentWallet](https://frames.ag) -- wallets for AI agents
- [Frames Registry](https://registry.mcpay.tech) -- pay-per-call API gateway
- [x402 Protocol](https://www.x402.org/) -- HTTP payment standard
