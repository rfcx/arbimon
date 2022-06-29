export interface Syncable {
  idArbimon: number
  updatedAt: Date
}

export const isSyncable = (candidate: unknown): candidate is Syncable => {
  const candidateAny = candidate as any

  // Reject invalid candidates
  if (
    candidateAny.idArbimon === undefined ||
    typeof candidateAny.idArbimon !== 'number' ||
    candidateAny.updatedAt === undefined ||
    !(candidateAny.updatedAt instanceof Date)
  ) throw new Error('Project does not contain needed sync status data')

  return true
}
