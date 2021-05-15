module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    "eslint:recommended",
    "standard",
    /* "plugin:prettier/recommended",
    "plugin:mocha/recommended", */
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "plugin:prettier/recommended",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 11,
    project: ["./tsconfig.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint" /*"mocha", "chai-friendly"*/],
  rules: {
    // TODO: fix and set to error or turn off if unneeded
    "no-unmodified-loop-condition": "warn",
    "@typescript-eslint/restrict-plus-operands": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    camelcase: "warn",
    "@typescript-eslint/prefer-regexp-exec": "warn",
    "@typescript-eslint/unbound-method": "warn",
    "no-use-before-define": "warn",
    "@typescript-eslint/restrict-template-expressions": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "prefer-template": "warn",
    curly: "error",

    "@typescript-eslint/require-await": "off",
    "no-unused-vars": "off",
    /* "mocha/no-mocha-arrows": "off", */
    // Disable the default rule
    "no-unused-expressions": 0,
    // Use the chai friendly rule
    /* "chai-friendly/no-unused-expressions": 2, */
  },
};
