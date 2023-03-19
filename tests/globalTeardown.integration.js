const { teardown: teardownDevServer } = require("jest-dev-server")
const tearDownDB = require("./globalTeardown")

module.exports = async function globalTeardown() {
  await teardownDevServer(globalThis.servers)
  // Your global teardown
  await tearDownDB()
}
