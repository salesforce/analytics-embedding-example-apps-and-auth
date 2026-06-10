// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

// Angular 22 flat-config setup using the unified `angular-eslint` package.
// TypeScript files and HTML templates are linted by separate blocks; inline
// component templates are extracted via `processInlineTemplates`.
export default tseslint.config(
  {
    ignores: ['dist/**', 'out-tsc/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // TypeScript handles "is this defined?" more accurately than the base
      // no-undef rule, which doesn't understand DOM globals (HTMLElement,
      // customElements, EventTarget).
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@angular-eslint/component-class-suffix': [
        'error',
        { suffixes: ['Component'] },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
);
