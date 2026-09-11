# SlashStack Agent Kernel

This repository uses SlashStack as its local agent operating layer.

## Operating Rules

- Read `.agents/memory/project.md` before substantial changes.
- Recall subsystem references from `.agents/references` when relevant.
- Preserve user changes and keep edits scoped.
- Use goal-driven execution for multi-step work: define scope, acceptance, verification, and completion criteria in `.agents/memory/goal-registry.json`.
- Parallel goals are allowed only when their write scopes do not overlap.
- Run verification before claiming work is complete.
- Capture durable project knowledge with the remember workflow.

## Installed Workflows

- `vibe`: read project memory and references, then produce a scoped build direction with in-scope / out-of-scope items and a single next step.
- `preflight`: inspect git status, discover project constraints (tests, build, lint, conventions), and flag risks with severity before coding.
- `audit`: review changes against the original goal, detect bugs / missing edge cases / regressions, and approve or reject with concrete evidence.
- `remember`: save durable subsystem knowledge to `.agents/memory/project.md`, rejecting transient state, commit hashes, TODOs, and secrets.
- `recall`: load saved references, validate them against the current codebase, flag stale ones, and summarize subsystem context.
- `improve`: capture reusable self-improvement patterns into `.agents/memory/patterns.json` without overwriting existing learning.
- `ship`: run tests, review the diff, confirm the goal, and produce an evidence summary or a blocker list with severity.
- `execute`: turn multi-step tasks into goals with explicit scope, acceptance criteria, verification commands, and completion expectations.
- `explain`: translate technical agent output into beginner-friendly language while preserving exact file paths and commands.
- `next`: suggest safe next prompts when the user is unsure what to ask, without editing until the user chooses.
- `security`: run a beginner-friendly pre-deploy safety review for secrets, auth, public routes, and risky exposure.
