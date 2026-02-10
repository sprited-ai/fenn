Skills System (Core Capability Layer)
Purpose

Fenn is evolving into a local-first financial operating engine that must support:

CLI workflows

automation pipelines

AI agent interaction

future UI surfaces

To prevent logic sprawl and duplicated implementations, Fenn adopts a Skills architecture — a structured capability layer that defines what Fenn knows how to do.

What is a Skill?

A Skill is a named, reusable capability that:

accepts structured input
→ performs domain logic
→ returns structured output


A skill represents a single financial action or analysis.

Examples:

portfolio_summary

risk_scan

tax_projection

account_sync

networth_report

Think:

Skill = executable domain capability

Not a script. Not a CLI command.
A formal unit of system intelligence.

Why Skills Exist

Without a capability layer:

logic spreads across CLI commands

duplicate implementations emerge

automation becomes brittle

AI integration becomes messy

Skills provide:

✅ modular architecture
✅ single source of truth
✅ consistent execution model
✅ validation & logging
✅ composability
✅ agent compatibility

Architectural Position

Skills sit at the core execution layer:

CLI / UI / Agent
        ↓
   Skill Dispatcher
        ↓
      Skills
        ↓
Domain + Storage Layer


All interfaces route through the same skills.

This guarantees:

one capability → many interfaces

Skill Structure

Each skill defines:

name
description
input schema
output schema
permissions (optional)
execution logic


Conceptual example:

Skill: portfolio_summary

Input:
  account_ids

Logic:
  aggregate balances
  compute allocation

Output:
  structured summary JSON

Execution Model

A dispatcher resolves and runs skills:

run(skill_name, input_data)


This allows:

CLI → skill execution

automation → skill execution

AI tools → skill execution

No interface-specific business logic.

Benefits for Fenn
Scalability

New features = new skills
No system rewiring required.

AI Readiness

Skills map cleanly to tool invocation systems
(MCP, agents, automation frameworks).

Maintainability

Skills are:

testable in isolation

easy to version

discoverable

Security

Permissions and auditing attach naturally to skill boundaries.

Design Principles

Single responsibility — one skill = one capability

Structured inputs/outputs — predictable contracts

Interface independence — skills don’t know who calls them

Composable — skills can call other skills

Local-first execution — user owns computation

Implementation Direction

Recommended structure:

fenn/
  skills/
    portfolio_summary.py
    tax_projection.py
  dispatcher.py
  domain/
  storage/


All business logic flows through skills.

Strategic Impact

Skills transform Fenn from:

CLI tool collection

into:

financial capability platform

This enables:

automation workflows

agent-driven finance operations

modular growth

future UI surfaces

without architectural churn.

TL;DR

Skills are Fenn’s:

core capability layer

They define what Fenn knows how to do — once — and make it accessible everywhere.