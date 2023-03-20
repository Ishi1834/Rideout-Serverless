/* eslint-disable indent */
module.exports =
  process.env.NODE_ENV === "integration"
    ? {
        testEnvironment: "node",
        verbose: true,
        forceExit: true,
        clearMocks: true,
        globalSetup: "./tests/globalSetup.integration.js",
        globalTeardown: "./tests/globalTeardown.integration.js",
        setupFilesAfterEnv: ["./tests/setUpFile.js"],
      }
    : {
        testEnvironment: "node",
        verbose: true,
        forceExit: true,
        clearMocks: true,
        globalSetup: "./tests/globalSetup.js",
        globalTeardown: "./tests/globalTeardown.js",
        setupFilesAfterEnv: ["./tests/setUpFile.js"],
        collectCoverage: true,
        collectCoverageFrom: ["./src/**"],
        testPathIgnorePatterns: ["/*.integration.test.js"],
      }
