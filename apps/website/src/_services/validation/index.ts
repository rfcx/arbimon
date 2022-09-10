export interface ValidationStatus {
  label: string
}

/**
 * WARNING: Validation status IDs must match the Core API Database IDs
 */
export const DEFAULT_VALIDATION_STATUS_ID = 0
export const VALIDATION_STATUS_BY_ID: Record<number, ValidationStatus> = {
  [DEFAULT_VALIDATION_STATUS_ID]: { label: 'Unvalidated' },
  1: { label: 'Present' },
  2: { label: 'Not Present' },
  3: { label: 'Unknown' }
}
