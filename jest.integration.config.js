module.exports = {
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  clearMocks: true,
  globalSetup: "./tests/globalSetup.integration.js",
  globalTeardown: "./tests/globalTeardown.integration.js",
  setupFilesAfterEnv: ["./tests/setUpFile.js"],
}
