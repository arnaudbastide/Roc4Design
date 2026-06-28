# Coding Tool Prompts

## Project Inspection

```text
Inspect this project and explain:
1. What the app does
2. The tech stack
3. How to run it locally
4. Important files and folders
5. Any obvious risks, missing setup, or broken patterns

Do not change files yet.
```

## Bug Fix

```text
Find and fix the bug where [describe bug].

Steps to reproduce:
1. [step]
2. [step]
3. [step]

Expected behavior:
[what should happen]

Actual behavior:
[what happens]

Make the smallest safe change, follow existing code style, and run relevant tests.
```

## Add Feature

```text
Add a feature that lets users [describe feature].

Requirements:
- [requirement 1]
- [requirement 2]
- [requirement 3]

Use existing project patterns. Avoid unrelated refactors. Add or update tests where appropriate.
```

## Code Review

```text
Review the current changes as if this were a pull request.

Focus on:
- Bugs
- Security issues
- Performance problems
- Missing edge cases
- Missing tests
- Maintainability risks

List findings by severity with file and line references. Do not rewrite code unless asked.
```

## Refactor

```text
Refactor [file/component/module] to improve readability and maintainability.

Constraints:
- Preserve existing behavior
- Keep public APIs unchanged
- Avoid large architectural changes
- Add tests if behavior is hard to verify

Explain what changed after editing.
```

## UI Improvement

```text
Improve the UI for [page/component].

Goals:
- Make it cleaner and easier to use
- Keep the existing visual style
- Ensure mobile and desktop layouts work
- Avoid decorative clutter
- Verify the app still builds

Make the actual code changes.
```

## Test Creation

```text
Add tests for [feature/module].

Cover:
- Normal successful behavior
- Important edge cases
- Error states
- Regression cases related to [specific bug if any]

Use the project's existing test framework and patterns.
```

## Performance Check

```text
Look for performance issues in [area of app].

Check:
- Expensive renders or loops
- Unnecessary network requests
- Slow database queries
- Large bundle or asset problems
- Avoidable blocking work

Fix only high-confidence issues and explain tradeoffs.
```

## Dependency Or Build Fix

```text
The project fails to build with this error:

[paste error]

Find the root cause and fix it. Prefer minimal changes. Do not upgrade major dependencies unless necessary. Run the build again after fixing.
```

## Full Implementation

```text
Implement [specific goal] end to end.

Before editing:
- Inspect the project structure
- Identify the relevant files
- Confirm the existing patterns

While editing:
- Keep the change scoped
- Follow existing style
- Avoid unrelated cleanup
- Add tests where useful

After editing:
- Run relevant checks
- Summarize changed files
- Mention anything you could not verify
```
