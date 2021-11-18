import { app } from './app.js'

const port = process.env.FASTIFY_PORT ?? 3000
const address = process.env.FASTIFY_ADDRESS ?? 'localhost'

await app.listen(port, address)
  .then(() => console.info(`*** Biodiversity API ***\nListening on http://${address}:${port}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
