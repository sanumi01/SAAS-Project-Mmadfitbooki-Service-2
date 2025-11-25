const tsParser = require('@typescript-eslint/parser');
module.exports = [
  { ignores: ['node_modules', 'dist', 'build', 'coverage', '*.bak-encoding', 'focus-scan.txt', 'build-log.txt', 'encoding-fix-report.json'] },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      'react-hooks': require('eslint-plugin-react-hooks')
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-static-element-interactions': 'off'
    },
    settings: { react: { version: 'detect' } }
  }
];
