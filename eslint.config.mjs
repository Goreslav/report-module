// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: {
      semi: true,
      quotes: 'single',
      // Opravené: použite 'always-multiline' namiesto 'es5'
      commaDangle: 'always-multiline',
    },
  },
  dirs: {
    src: [
      './playground',
      './src',
    ],
  },
})
  .append({
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      // Zmierniť pravidlá pre any typy v utility funkciách
      '@typescript-eslint/no-explicit-any': ['warn', {
        ignoreRestArgs: true,
      }],
      // Povoliť unused vars ak začínajú s _
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  });
