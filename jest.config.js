module.exports = {
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  clearMocks: true,
  globalSetup: "./src/tests/globalSetup.js",
  globalTeardown: "./src/tests/globalTeardown.js",
  setupFilesAfterEnv: ["./src/tests/setUpFile.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "./src/handlers/**",
    "./src/middleware/**",
    "./src/utils/**",
  ],
}
