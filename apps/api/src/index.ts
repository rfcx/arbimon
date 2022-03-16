import { env } from './_services/env'
import { createApp } from './app'

const port = env.FASTIFY_PORT ?? 3000
const address = env.FASTIFY_ADDRESS ?? 'localhost'

const app = await createApp()
app.log.info('*** Biodiversity API ***')

await app.listen(port, address)
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
