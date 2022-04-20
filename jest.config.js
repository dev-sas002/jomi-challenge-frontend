const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Only *.test.* files are suites, so helpers can live in `test-utils/` and
  // alongside the code without Jest trying to run them.
  testMatch: ["**/*.test.[jt]s?(x)"],
  // Mirrors `baseUrl: "."` in tsconfig.json, so imports resolve identically in
  // the editor, the build and the tests.
  moduleDirectories: ["node_modules", "<rootDir>"],
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "pages/**/*.{ts,tsx}",
    "theme/**/*.ts",
    "!**/*.d.ts",
  ],
};

module.exports = createJestConfig(customJestConfig);
