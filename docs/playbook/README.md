# Playbook Index

This directory is the reusable knowledge base extracted from the `ZJU Cat Merge` build process.

## Structure

### `guides/`
Long-form engineering doctrine and postmortem documents.

- `2D-Web-Game-VibeCoding-Architecture-and-Debugging-Guide.md`
  The architecture, debugging, and game-engine rules distilled from this project.
- `VibeCoding-Game-Requirements-Testing-and-Subagent-Workflow.md`
  The practical guide for requirement completeness, test strategy, and subagent usage.

### `templates/`
Ready-to-copy working docs for future projects.

- `GAME_PROJECT_KICKOFF_CHECKLIST.md`
  Start-of-project checklist for requirement gathering.
- `GAME_DEBUG_TESTING_TEMPLATE.md`
  Bug triage and test-planning template.
- `SUBAGENT_REVIEW_PROMPT_TEMPLATE.md`
  Structured prompt template for review-oriented subagents.

## Maintenance Rule

When a future project yields reusable lessons:

1. Put project-specific conclusions into the project's own delivery docs first.
2. Extract only durable, cross-project rules into `playbook/guides/`.
3. If the rule is repeatable as a workflow artifact, add a template under `playbook/templates/`.
4. If enough concrete examples accumulate, create `playbook/case-studies/` rather than bloating the guides.

## Version 1.0 Note

These playbook files are the companion knowledge package for the project's first satisfied milestone release.
