// ESLint 8 (el que está en package.json) usa este formato. El eslint.config.js
// anterior era de ESLint 9 e importaba paquetes que no están instalados.
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  overrides: [
    {
      // Primitivos generados por shadcn/ui: exportan las variantes (buttonVariants...) junto al componente
      files: ['src/components/ui/**'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  ],
}
