# Test Guardian Configuration Guide

## Overview

This configuration prevents opencode from automatically rewriting source files when unit tests are being written for them.

## How It Works

1. **Auto-detection**: Scans `app/`, `hooks/`, `components/`, `store/` directories for `.test.ts` files
2. **Pairing Detection**: Links `.test.ts` files with their companion source files
3. **Permission Prompt**: Asks user before blocking file edits during test writing

## Configuration Structure

```json
{
  "test-guardian": {
    "auto-scan": true,
    "detectors": [ /* file patterns */ ],
    "rules": [ /* protection rules */ ],
    "permission": { "edit": "ask" }
  }
}
```

## Protected Scenarios

- When creating/editing `.test.ts` files in monitored directories
- Source files with paired test files detected
- Conversation context mentions unit testing

## Exclusions

Currently empty. Add exclusions to `exclusions` array if needed.

## File Structure

- `.opencode/opencode.json` - Main config
- `.opencode/test-guardian-guide.md` - This guide
- `.opencode/mcp/commands/` - Action messages and scripts
