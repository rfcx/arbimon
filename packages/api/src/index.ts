import { env } from './_services/env/index.js'
import { app } from './app.js'

const port = env.FASTIFY_PORT ?? 3000
const address = env.FASTIFY_ADDRESS ?? 'localhost'

await app.listen(port, address)
  .then(() => console.info(`*** Biodiversity API ***\nListening on http://${address}:${port}`))
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
