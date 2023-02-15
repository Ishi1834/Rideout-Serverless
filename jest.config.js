module.exports = {
  verbose: true,
  forceExit: true,
  clearMocks: true,
  setupFilesAfterEnv: ["./src/tests/setUpFile.js"],
  collectCoverage: true,
  collectCoverageFrom: ["./src/handlers/**"],
}