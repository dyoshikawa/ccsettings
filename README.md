# ccsettings - Claude Code Settings Manager

A CLI tool for applying Claude Code configuration templates on a per-project basis. It allows developers to apply standardized configuration templates to their project's `.claude/settings.json` file and achieves intelligent merging with existing settings.

## Getting Started

```bash
# Apply casual template
npx ccsettings apply --template casual
```

## Features

- 🎯 **4 Built-in Templates**: casual, strict, node,etc.
- 🔗 **Multiple Configuration Sources**: Built-in, local files, URLs (GitHub support)
- 🧠 **Smart Merge**: Integrates templates while preserving existing settings
- 🔍 **Preview Function**: Preview changes with dry-run before applying
- 💾 **Backup Function**: Automatically saves settings before changes
- 🌐 **User-friendly Interface**: Clear and intuitive messages

## Installation

```bash
npm install -g ccsettings
# or
pnpm add -g ccsettings
# or
yarn global add ccsettings
```

## Basic Usage

### 1. Check Available Templates

```bash
ccsettings list
```

### 2. Apply Template (Dry Run)

```bash
ccsettings apply --template casual --dry-run
```

### 3. Apply Template

```bash
ccsettings apply --template strict
```

### 4. Show Current Settings

```bash
ccsettings show
```

## Command Reference

### apply command

Apply a template to the current project.

```bash
ccsettings apply [options]
```

#### Options

- `-t, --template <name>` - Specify built-in template
- `-f, --file <path>` - Load template from local file
- `-u, --url <url>` - Fetch template from URL
- `--dry-run` - Show preview only without making actual changes
- `--backup` - Backup settings before changes
- `--force` - Apply changes without confirmation

#### Usage Examples

```bash
# Apply default template
ccsettings apply

# Apply strict template
ccsettings apply --template strict

# Apply template from local file
ccsettings apply --file ./my-template.json

# Apply template from GitHub URL
ccsettings apply --url https://github.com/user/repo/blob/main/template.json

# Force apply with backup
ccsettings apply --template strict --backup --force

# Preview changes with dry run
ccsettings apply --template strict --dry-run
```

### list command

List available built-in templates.

```bash
ccsettings list
```

### show command

Display current project settings.

```bash
ccsettings show
```

## Template File Format

Custom templates can be created in the following JSON format:

```json
{
  "name": "my-template",
  "description": "Description of custom template",
  "settings": {
    "permissions": {
      "allow": [
        "Read(src/**)",
        "Edit(src/**)",
        "Bash(npm run test)"
      ],
      "deny": [
        "Bash(rm -rf *)",
        "Write(/etc/**)"
      ],
      "defaultMode": "acceptEdits"
    },
  }
}
```

## Merge Strategy

ccsettings merges existing settings with templates using the following strategy:

1. **Existing Settings Priority**: Existing setting values are preserved
2. **Array Merge**: Arrays like `allow` and `deny` are combined with duplicates removed
3. **Deep Merge**: Nested objects are recursively merged
4. **New Additions**: Items present in template but not in existing settings are added

### Merge Example

Existing settings:
```json
{
  "permissions": {
    "allow": ["Read(src/**)"],
    "defaultMode": "acceptEdits"
  }
}
```

Template:
```json
{
  "permissions": {
    "allow": ["Read(src/**)", "Edit(src/**)"],
    "deny": ["Bash(rm -rf *)"],
    "defaultMode": "default"
  }
}
```

Merge result:
```json
{
  "permissions": {
    "allow": ["Read(src/**)", "Edit(src/**)"],
    "deny": ["Bash(rm -rf *)"],
    "defaultMode": "acceptEdits"
  }
}
```

## GitHub URL Support

Template files on GitHub are automatically converted to raw file URLs:

```bash
# Regular GitHub URLs like this...
ccsettings apply --url https://github.com/user/repo/blob/main/template.json

# Are automatically converted to raw URLs
# https://raw.githubusercontent.com/user/repo/main/template.json
```

## Error Handling

- 📁 Clear error messages when files are not found
- 🔍 Specific problem identification for invalid JSON format
- 🌐 Proper handling of network errors
- ✅ Template schema validation

## License

MIT

## Contributing

Pull requests and issues are welcome. For bug reports or feature requests, please use [GitHub Issues](https://github.com/dyoshikawa/ccsettings/issues).

## Related Links

- [Claude Code Official Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Settings Reference](https://docs.anthropic.com/en/docs/claude-code/settings)