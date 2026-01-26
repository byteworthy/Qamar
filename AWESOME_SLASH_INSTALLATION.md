# awesome-slash Installation Guide

## Prerequisites Status

✅ **GitHub CLI** - Installing (GitHub CLI v2.85.0)
✅ **Global Permissions** - Updated in `C:\Users\richa\.claude\settings.local.json`

---

## Installation Commands

Run these commands in your Claude Code CLI (not in this session):

### Step 1: Add awesome-slash Marketplace

```bash
/plugin marketplace add avifenesh/awesome-slash
```

This will:
- Clone https://github.com/avifenesh/awesome-slash
- Add to: `C:\Users\richa\.claude\plugins\marketplaces\awesome-slash\`
- Register in: `C:\Users\richa\.claude\plugins\known_marketplaces.json`

---

### Step 2: Install All 7 Plugins

Run each command individually:

```bash
/plugin install next-task@awesome-slash
/plugin install ship@awesome-slash
/plugin install deslop@awesome-slash
/plugin install audit-project@awesome-slash
/plugin install drift-detect@awesome-slash
/plugin install enhance@awesome-slash
/plugin install sync-docs@awesome-slash
```

---

### Step 3: Authenticate GitHub CLI

After GitHub CLI installation completes, run:

```bash
gh auth login
```

Select:
- GitHub.com
- HTTPS
- Authenticate with browser

Verify authentication:

```bash
gh auth status
```

---

### Step 4: Restart Claude Code

Exit and restart your Claude Code CLI to load all new plugins.

---

## Verification Commands

After restart, test the installation:

### Check Help

```bash
/help
```

Should show the new commands: `/next-task`, `/ship`, `/deslop`, `/audit-project`, `/drift-detect`, `/enhance`, `/sync-docs`

### Test Individual Commands

```bash
/next-task --help
/ship --help
/deslop --help
/audit-project --help
/drift-detect --help
/enhance --help
/sync-docs --help
```

---

## Global Availability Test

Navigate to any other project and verify commands work:

```bash
cd C:\path\to\another\project
# Start new Claude Code session
/next-task --help
```

---

## Files Modified

| File | Status | Purpose |
|------|--------|---------|
| `C:\Users\richa\.claude\settings.local.json` | ✅ Updated | Added workflow permissions |
| `C:\Users\richa\.claude\plugins\known_marketplaces.json` | ⏳ Pending | Will be created by `/plugin marketplace add` |
| `C:\Users\richa\.claude\plugins\marketplaces\awesome-slash\` | ⏳ Pending | Will be created by marketplace add |
| GitHub CLI | 🔄 Installing | Required for PR workflows |

---

## Troubleshooting

### If `/plugin` commands fail:

1. Ensure you're running commands in Claude Code CLI (not this session)
2. Check Claude Code version supports plugin marketplace
3. Try alternative npm installation (see Alternative Method below)

### If GitHub auth fails:

```bash
# Check gh is in PATH
where gh

# Manually authenticate
gh auth login --web
```

---

## Alternative Installation Method (npm)

If the marketplace approach doesn't work:

```bash
# Install via npm
npm install -g awesome-slash@latest

# Run interactive installer
awesome-slash

# Select "Claude Code" when prompted

# Restart Claude Code
```

---

## What's Installed

Once complete, you'll have 7 global slash commands:

1. `/next-task` - End-to-end workflow automation (task → production)
2. `/ship` - Complete PR workflow (creation → merge)
3. `/deslop` - Remove debug code and AI artifacts
4. `/audit-project` - Multi-agent code review system
5. `/drift-detect` - Documentation-to-code synchronization
6. `/enhance` - Prompt and documentation analyzer
7. `/sync-docs` - Update docs for code changes

All commands will be available globally across all your Claude Code projects.

---

## Next Steps After Installation

1. Test in a small project first
2. Review workflow docs: https://github.com/avifenesh/awesome-slash
3. Set up task registry for `/next-task`:

```json
// tasks.json in project root
{
  "tasks": [
    {
      "id": "1",
      "title": "Example task",
      "priority": "high",
      "description": "Task details here"
    }
  ]
}
```

---

## Rollback Instructions

If you need to uninstall:

1. Remove marketplace entry from `C:\Users\richa\.claude\plugins\known_marketplaces.json`
2. Delete `C:\Users\richa\.claude\plugins\marketplaces\awesome-slash\`
3. Delete individual plugin directories from `C:\Users\richa\.claude\plugins\`
4. Restart Claude Code

---

Generated: 2026-01-25
