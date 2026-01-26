# awesome-slash Installation Status

## Completed Steps

### ✅ 1. Global Permissions Updated

File: `C:\Users\richa\.claude\settings.local.json`

Added the following permissions for awesome-slash workflows:

```json
"Bash(git worktree *)",
"Bash(gh pr *)",
"Bash(gh issue *)",
"Bash(npm run *)",
"Bash(npm test *)",
"TaskCreate",
"TaskUpdate",
"TaskList",
"Bash(git commit*)",
"Bash(git push*)"
```

**Status:** ✅ Complete

---

### 🔄 2. GitHub CLI Installation

**Status:** Installing (GitHub CLI v2.85.0)

The installation is currently running in the background via winget. Once complete, you'll need to:

1. **Close and reopen your terminal** to refresh PATH
2. **Authenticate with GitHub:**

```bash
gh auth login
```

3. **Verify authentication:**

```bash
gh auth status
```

**Expected output:**
```
github.com
  ✓ Logged in to github.com as <your-username>
  ✓ Git operations for github.com configured to use https protocol.
  ✓ Token: *******************
```

---

## Pending Manual Steps

You need to execute these commands yourself in a Claude Code CLI session:

### Step 1: Add awesome-slash Marketplace

```bash
/plugin marketplace add avifenesh/awesome-slash
```

### Step 2: Install All 7 Plugins

```bash
/plugin install next-task@awesome-slash
/plugin install ship@awesome-slash
/plugin install deslop@awesome-slash
/plugin install audit-project@awesome-slash
/plugin install drift-detect@awesome-slash
/plugin install enhance@awesome-slash
/plugin install sync-docs@awesome-slash
```

### Step 3: Restart Claude Code

Exit and restart your Claude Code CLI to load all new plugins.

---

## Verification Checklist

After completing the manual steps above:

### 1. Check GitHub CLI is working

```bash
# Should show path to gh.exe
where gh

# Should show version
gh --version

# Should show "Logged in to github.com"
gh auth status
```

### 2. Check Marketplace was Added

```bash
# On Windows
type "C:\Users\richa\.claude\plugins\known_marketplaces.json"
```

Should contain:
```json
{
  "marketplaces": {
    "awesome-slash": {
      "url": "https://github.com/avifenesh/awesome-slash",
      ...
    }
  }
}
```

### 3. Check Plugins were Installed

```bash
# List plugin directories
dir "C:\Users\richa\.claude\plugins\" /B
```

Should show:
- marketplaces/
- next-task/
- ship/
- deslop/
- audit-project/
- drift-detect/
- enhance/
- sync-docs/

### 4. Test Commands in Claude Code

In any Claude Code session:

```bash
/help
```

Should list the new commands. Test each:

```bash
/next-task --help
/ship --help
/deslop --help
/audit-project --help
/drift-detect --help
/enhance --help
/sync-docs --help
```

### 5. Test Global Availability

```bash
# Navigate to a different project
cd C:\path\to\another\project

# Start Claude Code
# Run any awesome-slash command
/next-task --help
```

Should work in ANY project, confirming global installation.

---

## Files Modified/Created

| File | Status | Action |
|------|--------|--------|
| `C:\Users\richa\.claude\settings.local.json` | ✅ Modified | Added workflow permissions |
| `C:\Program Files\GitHub CLI\gh.exe` | 🔄 Installing | GitHub CLI executable |
| `C:\Users\richa\.claude\plugins\known_marketplaces.json` | ⏳ Pending | Created by `/plugin marketplace add` |
| `C:\Users\richa\.claude\plugins\marketplaces\awesome-slash\` | ⏳ Pending | Created by marketplace add |
| `C:\Dev\Noor-CBT\AWESOME_SLASH_INSTALLATION.md` | ✅ Created | Installation guide |
| `C:\Dev\Noor-CBT\INSTALLATION_STATUS.md` | ✅ Created | This file |

---

## What You'll Get

Once installation is complete, you'll have 7 powerful slash commands:

| Command | Purpose |
|---------|---------|
| `/next-task` | End-to-end workflow: task selection → implementation → tests → PR → merge |
| `/ship` | Complete PR workflow: create → review → merge to production |
| `/deslop` | Clean up debug code, console.logs, TODO comments, AI artifacts |
| `/audit-project` | Multi-agent code review: security, performance, architecture |
| `/drift-detect` | Find mismatches between documentation and code |
| `/enhance` | Analyze and improve prompts, documentation, READMEs |
| `/sync-docs` | Update documentation when code changes |

**All commands work globally** across all your Claude Code projects.

---

## Next Steps

1. **Wait for GitHub CLI installation to complete** (check with `where gh`)
2. **Authenticate GitHub CLI** with `gh auth login`
3. **Run the plugin installation commands** listed above
4. **Restart Claude Code**
5. **Verify installation** using the checklist
6. **Test in a small project** before using on production codebases

---

## Troubleshooting

### GitHub CLI not in PATH

If `where gh` fails after installation:

1. Close and reopen terminal (PATH refresh)
2. Manually add to PATH: `C:\Program Files\GitHub CLI\`
3. Verify: `gh --version`

### `/plugin` commands not recognized

1. Ensure you're running in Claude Code CLI (not this session)
2. Check Claude Code version supports plugin marketplace
3. Try alternative npm installation (see AWESOME_SLASH_INSTALLATION.md)

### Authentication fails

```bash
# Alternative auth method
gh auth login --web

# Or use personal access token
gh auth login --with-token < token.txt
```

---

## Support

- awesome-slash GitHub: https://github.com/avifenesh/awesome-slash
- Claude Code docs: https://docs.anthropic.com/claude-code
- GitHub CLI docs: https://cli.github.com/manual/

---

Generated: 2026-01-25
Installation Session: Plan Implementation
