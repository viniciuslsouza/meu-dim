module.exports = {
  extends: ["../../packages/config/eslint-base.js"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  },
  overrides: [
    {
      files: ["test/**/*.ts"],
      parserOptions: {
        project: "./tsconfig.test.json",
        tsconfigRootDir: __dirname
      }
    }
  ]
};
