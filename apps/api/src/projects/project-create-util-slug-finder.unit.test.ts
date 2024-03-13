import { expect, test } from 'vitest'

import { uniqueSlug } from './project-create-util-slug-finder'

test('converts to kebab case', async () => {
  expect(await uniqueSlug('My AMAZING project', async () => true)).toBe('my-amazing-project')
})

test('removes special characters', async () => {
  expect(await uniqueSlug('josephine\'s first project!', async () => true)).toBe('josephines-first-project')
})

test('removes double spaces', async () => {
  expect(await uniqueSlug('test  test', async () => true)).toBe('test-test')
})

test('trims whitespace', async () => {
  expect(await uniqueSlug('  My Project  ', async () => true)).toBe('my-project')
})

test('trims words when string over 50 characters', async () => {
  expect(await uniqueSlug('Fire effects on bird communities from seasonally flooded forests along Amazon', async () => true)).toBe('fire-effects-on-bird-communities-from-seasonally')
})

test('trims characters when single word over 50 characters', async () => {
  expect(await uniqueSlug('FireeffectsonbirdcommunitiesfromseasonallyfloodedforestsalongAmazon', async () => true)).toBe('fireeffectsonbirdcommunitiesfromseasonallyfloodedf')
})

test('adds suffix when not initially unique', async () => {
  expect(await uniqueSlug('test', async (slug) => slug !== 'test')).toMatch(/test-[a-z0-9]{4}/)
})

test('adds suffix when not initially unique and keeping within 50 char limit', async () => {
  expect(await uniqueSlug('fireeffectsonbirdcommunitiesfromseasonallyflooded', async (slug) => slug !== 'fireeffectsonbirdcommunitiesfromseasonallyflooded')).toMatch(/fireeffectsonbirdcommunitiesfromseasonallyflo-[a-z0-9]{4}/)
})
