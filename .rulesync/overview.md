---
root: true
targets: ['*']
description: "project overview and architecture guide"
globs: ["**/*"]
---

# ccsettings - Claude Code Settings Manager

## Project Overview

**ccsettings** is a CLI tool for applying Claude Code configuration templates on a per-project basis. It allows developers to apply standardized configuration templates to their project's `.claude/settings.json` file and achieves intelligent merging with existing settings.

## Key Features

1. **Template Application**: Apply templates from presets, local files, or URLs
2. **Smart Merge**: Integrate template settings while preserving existing settings
3. **Preset Management**: Built-in configuration templates (default/strict/development/testing)
4. **Settings Display**: Check current settings state
5. **Backup**: Automatic saving of settings before changes

## Architecture

### Technology Stack
- **Language**: TypeScript
- **CLI Framework**: Commander.js  
- **Validation**: Zod (configuration schema validation)
- **HTTP Client**: Node.js fetch API
- **Utilities**: lodash-es (tree-shaking compatible)

### Project Structure
```
├── src/              # Source code (currently unimplemented)
├── CLAUDE.md         # Project guidelines
├── SPEC.md           # Detailed specification
├── package.json      # Package configuration
├── tsconfig.json     # TypeScript configuration
├── biome.json        # Code quality configuration
└── vitest.config.ts  # Test configuration
```

### Configuration File Format
```json
{
  "name": "template-name",
  "description": "Template description", 
  "settings": {
    "permissions": {
      "allow": ["Read(src/**)"],
      "deny": ["Bash(rm -rf *)"],
      "defaultMode": "acceptEdits"
    }
  }
}
```

## Command Specification

### Basic Commands
- `ccsettings apply` - Apply default template
- `ccsettings apply --template <name>` - Apply specified preset  
- `ccsettings apply --file <path>` - Apply local file
- `ccsettings apply --url <url>` - Apply from URL
- `ccsettings list` - List available templates
- `ccsettings show` - Show current settings

### Important Options
- `--dry-run` - Preview changes
- `--backup` - Backup settings  
- `--force` - Execute without confirmation

## Merge Strategy

1. **Existing Settings Priority**: Preserve existing `.claude/settings.json` values
2. **Array Merge**: Combine with duplicates removed
3. **Deep Object Merge**: Properly integrate nested objects
4. **Primitive Value Protection**: Do not change existing primitive values

## Development Status

**Current State**: Initial setup complete, implementation preparation stage
- ✅ Project structure setup
- ✅ Development environment setup (TypeScript, Biome, ESLint, Vitest)
- ✅ Specification documentation
- 🚧 Implementation in progress (src/ directory is empty)

## Quality Assurance

- **Linting**: Biome + ESLint + oxlint
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest with coverage
- **Security**: secretlint
- **Spell Checking**: cspell
