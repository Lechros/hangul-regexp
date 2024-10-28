// @ts-check

import eslint from '@eslint/js';
import eslintConfigPrettierRecommeded from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettierRecommeded,
  {
    ignores: ['.vscode/*', '.yarn/*', 'node_modules/*', '.pnp.*'],
  },
);
