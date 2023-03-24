module.exports = {
  testEnvironment: "node",
  verbose: false,
  forceExit: true,
  clearMocks: true,
  globalSetup: "./tests/globalSetup.js",
  globalTeardown: "./tests/globalTeardown.js",
  setupFilesAfterEnv: ["./tests/setUpFile.js"],
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  testPathIgnorePatterns: ["/*.integration.test.js"],
}
