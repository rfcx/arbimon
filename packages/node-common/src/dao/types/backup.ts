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
    entityId: number
    requestedBy: number
    requestedAt: Date
    expiresAt?: Date
    status: BackupStatus
    url?: string
    size?: number // number of MBs
}
