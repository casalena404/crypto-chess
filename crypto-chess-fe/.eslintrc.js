module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable some strict rules for development
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Custom rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    
    // React specific rules
    'react/prop-types': 'off', // We're using TypeScript
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    
    // Accessibility rules
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
