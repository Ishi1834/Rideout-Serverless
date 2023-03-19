const { setup: setupDevServer } = require("jest-dev-server")
const setUpDB = require("./globalSetup")

module.exports = async function globalSetup() {
  globalThis.servers = await setupDevServer({
    command: "sls offline start",
    launchTimeout: 50000,
    port: 3000,
  })
  await setUpDB()
}
