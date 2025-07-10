import eslint from '@eslint/js'
import noTypeAssertion from 'eslint-plugin-no-type-assertion'
import oxlint from 'eslint-plugin-oxlint'
import tseslint from 'typescript-eslint'

const config = tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'no-type-assertion': noTypeAssertion,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'no-type-assertion/no-type-assertion': 'error',
    },
  },
  // oxlintの設定の読み込みは最後に行うべき（oxlint公式の指示より）
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
)

export default config
