// import { getSequelize } from '@/db/connections'
// import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'

// const testProjectIdArbimon = 1920
// const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
// const biodiversitySequelize = await getSequelize()

// beforeAll(() => {

// })

describe('First time sync', () => {
  test.todo('CREATED: new project created successfully')
  test.todo('CREATED: new project version created successfully')
  test.todo('CREATED: sites created with current project versions')
})

describe('Existing project sync', () => {
  test.todo('UPDATED: project - slug updated')
  test.todo('UPDATED: project - name updated')
  test.todo('UPDATED: site - name updated')
  test.todo('UPDATED: site - location (lat, lon, alt) updated')
  test.todo('CREATED: new sites created with current project versions')
})
