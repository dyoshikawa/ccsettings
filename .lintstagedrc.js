export default {
  "*.{ts,tsx,js,jsx}": [
    "biome check --write",
    "oxlint --fix --max-warnings 0",
    "eslint --fix --max-warnings 0 --cache --no-warn-ignored",
  ],
  "*.{ts,tsx}": [() => "tsgo --noEmit", () => "pnpm test"],
  "**/*": ["secretlint --secretlintignore .gitignore", "cspell"],
};
