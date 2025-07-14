# ccsettings

CLI tool to apply Claude Code setting templates on a per-project basis

## Installation

```bash
npm install -g ccsettings
# or
pnpm add -g ccsettings
# or
yarn global add ccsettings
```

## Usage

### Apply Templates

Apply default template:
```bash
ccsettings apply
```

Apply a specific preset template:
```bash
ccsettings apply --template strict
```

Apply template from local file:
```bash
ccsettings apply --file ./my-template.json
```

Apply template from URL:
```bash
ccsettings apply --url https://example.com/template.json
```

### Other Commands

List available templates:
```bash
ccsettings list
```

Show current settings:
```bash
ccsettings show
```

### Options

- `--dry-run` - Preview the result without making actual changes
- `--backup` - Backup settings before making changes
- `--force` - Overwrite without confirmation

## Built-in Templates

### default
Basic permission settings. Allows minimal permissions necessary for development.

### strict
Strict security settings. Only allows reading and writing code, prohibits command execution and web fetching.

### development
Relaxed settings for development environments. Allows a wide range of permissions necessary for local development.

### testing
Specialized settings for test execution. Allows running test tools and editing test files.

## Template Format

Create custom templates in the following format:

```json
{
  "name": "my-template",
  "description": "Custom template description",
  "settings": {
    "permissions": {
      "allow": [
        "Read(src/**)",
        "Edit(src/**)",
        "Bash(npm run test:*)"
      ],
      "deny": [
        "Bash(rm -rf *)",
        "Edit(.env*)"
      ],
      "defaultMode": "default"
    }
  }
}
```

## Merge Strategy

When existing configuration files are present, merging follows these rules:

1. Arrays (allow/deny) are merged with duplicates removed
2. Primitive values (defaultMode) prioritize existing settings
3. Non-existent fields are added from the template

## License

MIT