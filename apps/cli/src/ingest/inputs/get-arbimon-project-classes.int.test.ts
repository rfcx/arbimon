import { beforeAll, describe, expect, test } from 'vitest'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonProjectClasses } from '@/ingest/inputs/get-arbimon-project-classes'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

describe('ingest > inputs > getArbimonProjectClasses', () => {
  beforeAll(async () => {
    await arbimonSequelize.query('DELETE FROM project_classes')
    await arbimonSequelize.query(`
    INSERT INTO project_classes (project_class_id,project_id,species_id,songtype_id)
    VALUES 
      (4337,1920,74,1),
      (4338,1920,74,2),
      (4339,1920,1050,1),
      (4340,1920,1050,2),
      (4341,1920,3842,1);
    `)
  })

  const PROJECT_1 = 1920
  const PROJECT_2 = 1921
  const IDS_PROJECT_1_SPECIES = [74, 1050, 3842]
  const IDS_PROJECT_2_SPECIES = [74, 42251]

  test('can get project classes', async () => {
    // Act
    const actual = await getArbimonProjectClasses(arbimonSequelize, PROJECT_1)

    // Assert
    expect(actual.length).toBe(3)
    const filteredSpeciesId = actual.map((item: any) => item.taxonSpeciesId)
    IDS_PROJECT_1_SPECIES.forEach(expectedProp => expect(filteredSpeciesId).toContain(expectedProp))
  })

  test('can get new project classes', async () => {
    // Arrange
    const sql = `
      INSERT INTO project_classes (project_class_id,project_id,species_id,songtype_id)
      VALUES 
        (4337,1920,74,3),
        (4338,1920,42251,2);
      `
    await arbimonSequelize.query(sql)
    const NEW_PROJECT_SPECIES = [42251]

    // Act
    const actual = await getArbimonProjectClasses(arbimonSequelize, PROJECT_1)

    // Assert
    expect(actual.length).toBe(4)
    const newArray = [...IDS_PROJECT_1_SPECIES, ...NEW_PROJECT_SPECIES]
    const filteredSpeciesId = actual.map((item: any) => item.taxonSpeciesId)
    newArray.forEach(expectedProp => expect(filteredSpeciesId).toContain(expectedProp))
  })

  test('can get project classes for the next project', async () => {
    // Arrange
    const sql = `
      INSERT INTO project_classes (project_class_id,project_id,species_id,songtype_id)
      VALUES 
        (4337,1921,74,3),
        (4338,1921,42251,2);
      `
    await arbimonSequelize.query(sql)

    // Act
    const actual = await getArbimonProjectClasses(arbimonSequelize, PROJECT_2)

    // Assert
    expect(actual.length).toBe(2)
    const filteredSpeciesId = actual.map((item: any) => item.taxonSpeciesId)
    IDS_PROJECT_2_SPECIES.forEach(expectedProp => expect(filteredSpeciesId).toContain(expectedProp))
  })
})
