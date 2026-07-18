import { describe, expect, test } from 'vitest'

import { masterObjectiveTypes } from '@rfcx-bio/node-common/dao/master-data/project-objective'

import { getImageByObjectives, resolveProjectImage } from './image-by-objective'

describe('test get image by objectives', () => {
  test('undefined objectives', () => {
    const result = getImageByObjectives(undefined)
    expect(result).toBe(masterObjectiveTypes.Others.imageUrl)
  })
  test('empty objectives', () => {
    const inputObjectives: string[] = []
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterObjectiveTypes.Others.imageUrl)
  })
  test('one objective: other', () => {
    const inputObjectives: string[] = ['blah blah']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterObjectiveTypes.Others.imageUrl)
  })
  test('one objective: bio-baseline', () => {
    const inputObjectives: string[] = ['bio-baseline']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterObjectiveTypes.BioBaseline.imageUrl)
  })
  test('one objective: monitor-species', () => {
    const inputObjectives: string[] = ['monitor-species']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterObjectiveTypes.MonitorSpecies.imageUrl)
  })
  test('one objective: monitor-illegal-act', () => {
    const inputObjectives: string[] = ['monitor-illegal-act']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterObjectiveTypes.MonitorIllegalAct.imageUrl)
  })
  test('one objective: impact-human', () => {
    const inputObjectives: string[] = ['impact-human']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterObjectiveTypes.ImpactHuman.imageUrl)
  })
  test('one objective: impact-conservation', () => {
    const inputObjectives: string[] = ['impact-conservation']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterObjectiveTypes.ImpactConservation.imageUrl)
  })
  test('more than 1 objectives: bio-baseline, monitor-species, other', () => {
    const inputObjectives: string[] = ['bio-baseline', 'monitor-species', 'blah blah']
    const result = getImageByObjectives(inputObjectives)
    const expectResults = [masterObjectiveTypes.BioBaseline.imageUrl, masterObjectiveTypes.MonitorSpecies.imageUrl, masterObjectiveTypes.Others.imageUrl]
    expect(expectResults).toContain(result)
  })
  test('more than 1 objectives: impact-conservation, impact-human', () => {
    const inputObjectives: string[] = ['impact-conservation', 'impact-human']
    const result = getImageByObjectives(inputObjectives)
    const expectResults = [masterObjectiveTypes.ImpactConservation.imageUrl, masterObjectiveTypes.ImpactHuman.imageUrl, masterObjectiveTypes.Others.imageUrl]
    expect(expectResults).toContain(result)
  })
})

describe('resolveProjectImage', () => {
  test('keeps a stored custom storage path', () => {
    const stored = 'projects/724/project-profile-image-abcd1234.png'
    expect(resolveProjectImage(stored, ['bio-baseline'])).toBe(stored)
  })
  test('keeps a stored static:// reference', () => {
    const stored = 'static://project/monitor-species.png'
    expect(resolveProjectImage(stored, ['bio-baseline'])).toBe(stored)
  })
  test('keeps a stored absolute URL', () => {
    const stored = 'https://example.com/photo.jpg'
    expect(resolveProjectImage(stored, [])).toBe(stored)
  })
  test('empty string falls back to objective default', () => {
    expect(resolveProjectImage('', ['bio-baseline'])).toBe(masterObjectiveTypes.BioBaseline.imageUrl)
  })
  test('undefined falls back to objective default', () => {
    expect(resolveProjectImage(undefined, ['monitor-species'])).toBe(masterObjectiveTypes.MonitorSpecies.imageUrl)
  })
  test('null falls back to objective default', () => {
    expect(resolveProjectImage(null, undefined)).toBe(masterObjectiveTypes.Others.imageUrl)
  })
  test('no image and no objectives falls back to Others', () => {
    expect(resolveProjectImage('', [])).toBe(masterObjectiveTypes.Others.imageUrl)
  })
})
