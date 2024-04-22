// export type BackupStatus = 'requested' | 'processing' | 'available'
export enum BackupStatus {
    REQUESTED = 'requested',
    PROCESSING = 'processing',
    AVAILABLE = 'available'
}
export type BackupType = 'project'

export interface Backup {
    id: number
    entity: BackupType
    entity_id: number
    requested_by: number
    requested_at: Date
    expires_at?: Date
    status: BackupStatus
    url?: string
    size?: number // number of MBs
}
