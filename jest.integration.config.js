module.exports = {
  testEnvironment: "node",
  verbose: false,
  forceExit: true,
  clearMocks: true,
  globalSetup: "./tests/globalSetup.integration.js",
  globalTeardown: "./tests/globalTeardown.integration.js",
  setupFilesAfterEnv: ["./tests/setUpFile.js"],
  testPathIgnorePatterns: ["./src/"],
}
