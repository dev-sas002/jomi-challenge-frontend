const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^components/(.*)$": "<rootDir>/components/$1",
    "^lib/(.*)$": "<rootDir>/lib/$1",
    "^graphql/(.*)$": "<rootDir>/graphql/$1",
  },
};

module.exports = createJestConfig(customJestConfig);

