---
name: ship
description: Take finished work in this repository from the working tree to a merged pull request. Use when asked to ship the current work, or to open and merge a pull request for it.
disable-model-invocation: true
---

# Ship the current work

Stop and report if any step fails and you cannot fix the cause. Never skip a hook or a check to get past it.

1. **Branch.** If you are on `main`, create a branch named `feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `ci/` or
   `chore/` plus a short description.

2. **Run the gates.** `bun run check`, `bun run build` and `bun run test:e2e`. For a UI change, also run the
   `verify-ui` skill and resolve what it finds.

3. **Commit.** Use Conventional Commits, with one concern per commit.

4. **Open the pull request.** Run `git push -u origin HEAD`, then `gh pr create` with a Conventional Commits title and
   the body from `.github/pull_request_template.md`. Tick only what you actually did, and say why anything else does
   not apply.

5. **Wait for CI.** Run `gh pr checks <number> --watch --fail-fast`. GitHub does not enforce this, so never merge
   before every check has passed. If one fails, fix the cause, push and wait again.

6. **Check for Myanmar copy.** Run this, and if it prints anything, stop here and leave the pull request for the owner:

   ```sh
   git diff --name-only origin/main...HEAD | grep -E 'i18n/dictionaries/my/|packages/content/src/data/'
   ```

7. **Merge.** Run `gh pr merge <number> --rebase`. Do not add `--admin` or `--auto`. Do not add `--delete-branch`
   either: it fails in a worktree when `main` is checked out elsewhere, and GitHub already deletes merged branches.

8. **Report.** Give the pull request URL and say that the deploy now waits for the owner to approve the `production`
   environment. Never approve it yourself.
