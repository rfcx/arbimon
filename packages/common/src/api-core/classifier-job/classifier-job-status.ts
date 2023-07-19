export const CLASSIFIER_JOB_STATUS = {
  WAITING: 0,
  RUNNING: 20,
  DONE: 30,
  ERROR: 40,
  CANCELLED: 50
} as const

export const CLASSIFIER_JOB_LABELS: Record<number, string> = {
  0: 'Queued',
  20: 'Processing',
  30: 'Done',
  40: 'Error',
  50: 'Cancelled'
}
