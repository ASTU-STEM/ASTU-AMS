const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup-env.js"],
  transform: {
    ...tsJestTransformCfg,
  },
  testTimeout: 60000,
  moduleNameMapper: {
    "^uuid$": require.resolve("uuid"),
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};