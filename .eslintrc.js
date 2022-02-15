module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    "indent": ["error", 4],
    "semi": ["error", "always"],
    "no-array-constructor": "off",
    "no-new": "off",
    "no-case-declarations": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: ["variable", "function", "classProperty", "classMethod"],
        format: ["camelCase"]
      },
      {
        selector: ["class", "enum", "enumMember", "interface"],
        format: ["PascalCase"]
      }
    ]
  }
}
