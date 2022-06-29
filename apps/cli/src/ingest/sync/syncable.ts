export interface Syncable {
  idArbimon: number
  updatedAt: Date
}

export const isSyncable = (candidate: unknown): candidate is Syncable => {
  const candidateAny = candidate as any
  const updatedAtDate = Date.parse(candidateAny.updatedAt)

  // Reject invalid candidates
  if (
    candidateAny.idArbimon === undefined ||
    typeof candidateAny.idArbimon !== 'number' ||
    candidateAny.updatedAt === undefined ||
    isNaN(updatedAtDate)
  ) throw new Error('Input does not contain needed sync status data')

  return true
}
