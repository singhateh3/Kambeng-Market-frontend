import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // The installed eslint-plugin-react-hooks (v5.2.0) exports three
      // config shapes: `recommended` is the legacy eslintrc format
      // (`plugins: ["react-hooks"]`, incompatible with flat config —
      // confirmed by trying it), `recommended-legacy` likewise, and
      // `recommended-latest` is the actual flat-config-ready preset
      // (`plugins: { "react-hooks": ... }`). No `.flat` namespace exists
      // on this version (that was a transitional shape from an earlier
      // pre-release this config was apparently written against).
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
