import { describe, expect, test } from 'vitest'

import { masterOjectiveTypes } from '@rfcx-bio/common/dao/master-data/project-objective'

import { getImageByObjectives, getIndex } from './image-by-objective'

describe('test get index', () => {
  test('length 0', () => {
    const inputLength = 0
    const result = getIndex(inputLength)
    expect(result).toBe(0)
  })
  test('length 1', () => {
    const inputLength = 1
    const result = getIndex(inputLength)
    expect(result).toBe(0)
  })
  test('length 2', () => {
    const inputLength = 2
    const result = getIndex(inputLength)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })
  test('length 3', () => {
    const inputLength = 3
    const result = getIndex(inputLength)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(2)
  })
})

describe('test get image by objectives', () => {
  test('empty objectives', () => {
    const inputObjectives: string[] = []
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterOjectiveTypes.Others.imageUrl)
  })
  test('one objective: other', () => {
    const inputObjectives: string[] = ['blah blah']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterOjectiveTypes.Others.imageUrl)
  })
  test('one objective: bio-baseline', () => {
    const inputObjectives: string[] = ['bio-baseline']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterOjectiveTypes.BioBaseline.imageUrl)
  })
  test('one objective: monitor-species', () => {
    const inputObjectives: string[] = ['monitor-species']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterOjectiveTypes.MonitorSpecies.imageUrl)
  })
  test('one objective: monitor-illegal-act', () => {
    const inputObjectives: string[] = ['monitor-illegal-act']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterOjectiveTypes.MonitorIllegalAct.imageUrl)
  })
  test('one objective: impact-human', () => {
    const inputObjectives: string[] = ['impact-human']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterOjectiveTypes.ImpactHuman.imageUrl)
  })
  test('one objective: impact-conservation', () => {
    const inputObjectives: string[] = ['impact-conservation']
    const result = getImageByObjectives(inputObjectives)
    expect(result).toBe(masterOjectiveTypes.ImpactConservation.imageUrl)
  })
  test('more than 1 objectives: bio-baseline, monitor-species, other', () => {
    const inputObjectives: string[] = ['bio-baseline', 'monitor-species', 'blah blah']
    const result = getImageByObjectives(inputObjectives)
    const expectResults = [masterOjectiveTypes.BioBaseline.imageUrl, masterOjectiveTypes.MonitorSpecies.imageUrl, masterOjectiveTypes.Others.imageUrl]
    expect(expectResults).toContain(result)
  })
  test('more than 1 objectives: impact-conservation, impact-human', () => {
    const inputObjectives: string[] = ['impact-conservation', 'impact-human']
    const result = getImageByObjectives(inputObjectives)
    const expectResults = [masterOjectiveTypes.ImpactConservation.imageUrl, masterOjectiveTypes.ImpactHuman.imageUrl, masterOjectiveTypes.Others.imageUrl]
    expect(expectResults).toContain(result)
  })
})
