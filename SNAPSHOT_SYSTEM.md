# Smart Universe Task Flow - Snapshot System

## Overview

The Snapshot System provides automatic and manual version control for the Smart Universe Task Flow application. It creates git commits for every code change, allowing easy tracking and rollback of modifications.

## Features

- ✅ **Automatic Snapshots**: Creates commits for every code change
- ✅ **Manual Snapshots**: Create custom commits with specific messages
- ✅ **Smart Commit Messages**: Automatically generates descriptive commit messages
- ✅ **Change Tracking**: Tracks added, modified, and deleted files
- ✅ **History Management**: View complete snapshot history
- ✅ **Revert Capability**: Rollback to any previous snapshot
- ✅ **Status Monitoring**: Check current working directory status

## Quick Start

### 1. Create Automatic Snapshot
```bash
./scripts/snapshot.sh
# or
./scripts/snapshot.sh auto
```

### 2. Create Manual Snapshot
```bash
./scripts/snapshot.sh manual "Fix PDF generation issue"
```

### 3. View History
```bash
./scripts/snapshot.sh history
```

### 4. Revert to Previous Snapshot
```bash
./scripts/snapshot.sh revert faac997
```

### 5. Check Status
```bash
./scripts/snapshot.sh status
```

## Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `auto` | Create automatic snapshot | `./scripts/snapshot.sh auto` |
| `manual <message>` | Create manual snapshot | `./scripts/snapshot.sh manual "Fix bug"` |
| `history` | Show snapshot history | `./scripts/snapshot.sh history` |
| `revert <hash>` | Revert to specific commit | `./scripts/snapshot.sh revert faac997` |
| `status` | Show current status | `./scripts/snapshot.sh status` |
| `help` | Show help message | `./scripts/snapshot.sh help` |

## Automatic Commit Messages

The system automatically generates descriptive commit messages based on the types of changes:

### Examples:
- `Update frontend backend - 3 added, 2 modified files changed (2025-07-28 04:50:15)`
- `Update dependencies - 1 modified files changed (2025-07-28 04:45:30)`
- `Update config - 2 modified files changed (2025-07-28 04:40:22)`

### Change Detection:
- **Frontend**: Files in `src/` directory
- **Backend**: Files in `server/` directory  
- **Dependencies**: `package.json` and `package-lock.json`
- **Config**: Configuration files like `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`

## Git Hooks

The system includes a pre-commit hook that automatically creates snapshots before any git commit:

### Location: `.git/hooks/pre-commit`
- Automatically runs the snapshot script before commits
- Ensures no changes are lost
- Provides consistent version control

## Current Snapshot History

```
faac997 - Final comprehensive PDF fixes - logo display, Arabic text alignment, terms editing, text direction
3deee23 - Enhanced PDF generation - improved html2canvas options, better quality rendering, added test function
9d4ab7b - Final PDF fixes - page number visible, Arabic terms display, line item totals calculation fixed
d0d6619 - Final PDF fixes - footer visibility restored, Arabic text spacing improved, Riyal symbol size standardized
a044a41 - Final PDF fixes - logo matches attached design, Arabic text fixed, Riyal symbol size adjusted, footer space reduced
eaca9ee - Snapshot before PDF fixes - logo, Arabic text, Riyal symbol, footer spacing
b1b98f9 - Update API base URL to production domain
2f687b7 - Seed superadmin users admin@smartuniit.com and shakeel.ali@smartuniit.com with password P@ssw0rd123
388f0f0 - Update database name to smartuniit_taskflow.db
aeb999d - Fix deployment script and add PM2 ecosystem config
```

## Best Practices

### 1. Regular Snapshots
- Create snapshots frequently during development
- Use automatic snapshots for small changes
- Use manual snapshots for significant features

### 2. Descriptive Messages
- Use clear, descriptive messages for manual snapshots
- Include the purpose of the change
- Mention affected components

### 3. Before Major Changes
- Create a snapshot before making major changes
- This provides a safe rollback point

### 4. Testing Snapshots
- Test the application after creating snapshots
- Ensure the snapshot represents a working state

## Troubleshooting

### Issue: "Not in a git repository"
**Solution**: Ensure you're in the project root directory and git is initialized.

### Issue: "No changes to commit"
**Solution**: This is normal when there are no uncommitted changes.

### Issue: Revert failed
**Solution**: 
1. Check the commit hash exists: `git log --oneline`
2. Ensure you have the correct hash
3. Make sure you have no uncommitted changes

### Issue: Permission denied
**Solution**: Make the script executable:
```bash
chmod +x scripts/snapshot.sh
```

## Integration with Development Workflow

### 1. Before Starting Work
```bash
./scripts/snapshot.sh status
```

### 2. During Development
```bash
# Automatic snapshots for small changes
./scripts/snapshot.sh

# Manual snapshots for features
./scripts/snapshot.sh manual "Add user authentication feature"
```

### 3. Before Testing
```bash
./scripts/snapshot.sh manual "Pre-testing snapshot"
```

### 4. After Testing
```bash
./scripts/snapshot.sh manual "Post-testing - all features working"
```

## Advanced Usage

### View Detailed History
```bash
git log --oneline --graph --decorate -20
```

### Compare Snapshots
```bash
git diff faac997..3deee23
```

### Create Branch from Snapshot
```bash
git checkout -b feature-branch faac997
```

### Merge Snapshots
```bash
git merge faac997
```

## File Structure

```
scripts/
├── snapshot.sh          # Main snapshot script
.git/hooks/
├── pre-commit          # Automatic pre-commit hook
SNAPSHOT_SYSTEM.md      # This documentation
```

## Support

For issues or questions about the snapshot system:
1. Check this documentation
2. Run `./scripts/snapshot.sh help`
3. Review the git log: `git log --oneline`

---

**Last Updated**: 2025-07-28  
**Version**: 1.0  
**Maintainer**: Smart Universe Development Team 