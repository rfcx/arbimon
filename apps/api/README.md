# Biodiversity > API

Biodiversity backend code built with Fastify, Typescript, and pnpm.

## Setup

- Copy `.env.example` to `.env`
- Fill in values as needed
- **Verify that you have not accidentally changed `.env.example`**

## Standards

- We use the `async` / `return` / `throw` convention [[1]](https://www.fastify.io/docs/latest/Routes/#promise-resolution)[[2]](https://www.fastify.io/docs/latest/Reply/#async-await-and-promises):

  ```ts
  app.get('/', async (req, res) => {
    // do not call res.send
    if(...) throw ApiServerError()
    return { hello: 'world' }
  })
  ```
