# Git Workflow — BudgetBuddy AI Team

To avoid overwriting each other's work, follow this simple flow:

## 1. One-time setup (each member)

```bash
git clone <repo-url>
cd BudgetBuddy-AI
```

## 2. Create your own branch before starting work

Use a branch name that matches your task:

```bash
git checkout -b member1-frontend
git checkout -b member2-backend
git checkout -b member3-categorization
git checkout -b member4-chat-advisor
git checkout -b member5-ocr
git checkout -b member6-forecast
```

## 3. Work only inside your assigned files

Check `TASKS.md` for exactly which files are yours. This keeps merge conflicts to a minimum since everyone is editing different files.

## 4. Commit and push regularly

```bash
git add .
git commit -m "Add categorization keyword dictionary"
git push origin member3-categorization
```

Commit small, working chunks often — don't wait until your whole feature is done to push.

## 5. Open a Pull Request (PR)

On GitHub, open a PR from your branch into `main`. Add a short description of what you built. Ask one other teammate to glance at it before merging (even a 1-minute look helps catch obvious issues).

## 6. Pull the latest `main` before you keep working

```bash
git checkout main
git pull origin main
git checkout member3-categorization
git merge main
```

Do this periodically so your branch doesn't drift too far from everyone else's progress.

## 7. Final integration (a few hours before submission)

- Member 2 merges all module branches into `main` one at a time
- Run through `TASKS.md` checklists to confirm every feature works end-to-end
- Do a full walkthrough together before the deadline — better to find a bug at 8pm than during the live demo
