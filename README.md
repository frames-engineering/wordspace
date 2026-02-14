# Wordspace Demos

Example workflows and skill configurations for building AI agent systems with [OpenProse](https://github.com/openprose/prose), [AgentWallet](https://frames.ag), and the [Frames Registry](https://registry.mcpay.tech).

## What's Inside

### Workflows

| File | Description |
|------|-------------|
| [`workflows/x-daily-pulse.prose`](workflows/x-daily-pulse.prose) | Multi-agent Twitter/X intelligence briefing. Fetches real tweet data via paid API calls, analyzes engagement, and produces a daily digest with draft replies. |

### Skills

This repo bundles four Claude Code skills (symlinked from `.agents/skills/`):

| Skill | Description |
|-------|-------------|
| **open-prose** | Programming language for AI sessions. Orchestrate multi-agent workflows with `.prose` files. |
| **agentwallet** | Server-side crypto wallets for AI agents. Handles x402 micropayments, transfers, and policy-controlled signing. |
| **registry** | Pay-per-call API gateway (Twitter, Exa search, AI generation, x402 test). No API keys needed. |
| **websh** | A shell for the web. Navigate URLs like directories with `cd`, `ls`, `grep`, and `cat`. |

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- An [AgentWallet](https://frames.ag) account (for paid API workflows)
- Wallet funded with USDC (even $1 covers hundreds of API calls)

## Quick Start

### 1. Install skills

Skills are already bundled in this repo. Claude Code picks them up automatically from the `skills/` directory.

### 2. Run the X Daily Pulse workflow

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

### 3. Explore other skills

```bash
# Browse the web like a filesystem
websh

# Check your wallet balance
agentwallet

# Discover available APIs
# Visit https://registry.mcpay.tech/api/services
```

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

## Project Structure

```
wordspace-demos/
├── workflows/              # Runnable .prose programs
│   └── x-daily-pulse.prose
├── skills/                 # Symlinks to bundled skills
│   ├── open-prose -> ../.agents/skills/open-prose
│   ├── agentwallet -> ../.agents/skills/agentwallet
│   ├── registry -> ../.agents/skills/registry
│   └── websh -> ../.agents/skills/websh
├── .agents/skills/         # Skill source files
├── .prose/                 # Runtime state (auto-generated)
│   └── runs/               # Execution logs and bindings
└── .claude/                # Claude Code settings
```

## Links

- [OpenProse](https://github.com/openprose/prose) -- the programming language for AI sessions
- [AgentWallet](https://frames.ag) -- wallets for AI agents
- [Frames Registry](https://registry.mcpay.tech) -- pay-per-call API gateway
- [x402 Protocol](https://www.x402.org/) -- HTTP payment standard
