# Biodiversity > API

Biodiversity backend code

## Standards

This is an ESM module written in TypeScript:
- Imports must end with `.js` (even if the file is `.ts`)
- Most functions are async
- We use the [`async`/`return` convention](https://www.fastify.io/docs/latest/Routes/#promise-resolution):

```ts
app.get('/', async (req, res) => {
  return { hello: 'world' }
  // do not call res.send
})
```

## Resources

- [TypeScript for Fastify](https://www.fastify.io/docs/latest/TypeScript)