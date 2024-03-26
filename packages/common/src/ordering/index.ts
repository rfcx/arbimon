export interface SortCriteria {
  name: string
  ordering: 'asc' | 'desc'
}

export class SortCondition {
  private values: SortCriteria[] = []

  constructor (input: string) {
    const values = input
      .trim()
      .split(',')
      .map(value => value.trim())
      .filter(value => value !== '' && value !== '-')
      .map(value => {
        if (value.startsWith('-')) {
          const columnName = value.slice(1)

          const criteria: SortCriteria = {
            name: columnName.trim(),
            ordering: 'desc'
          }

          return criteria
        }

        const criteria: SortCriteria = {
          name: value,
          ordering: 'asc'
        }

        return criteria
      })

    this.values = values
  }

  public get (index: number): SortCriteria | undefined {
    return this.values?.[index]
  }

  public isEmpty (): boolean {
    return this.values.length === 0
  }

  public rename (oldName: string, newName: string): boolean {
    const index = this.values.findIndex(v => v.name === oldName)

    if (index === -1) {
      return false
    }

    this.values[index].name = newName
    return true
  }

  public keep (keys: string[]): void {
    this.values = this.values.filter(v => {
      return keys.includes(v.name)
    })
  }

  public toString (): string {
    return this.values.map(v => {
      if (v.ordering === 'desc') {
        return `-${v.name}`
      }

      return v.name
    }).join(',')
  }

  public getValues (): SortCriteria[] {
    return this.values
  }
}
