export type MailTemplate = 'project-backup' | 'export-detections' | 'project-backup-failed'

const projectBackupSubject = 'Arbimon project backup ready'
const projectBackupBody = ({ url, projectName }: { url: string, projectName: string }): string => `
  <p style="color:black;margin-top:0">Hello,</p>
  <p style="color:black;">
    Thanks so much for using Arbimon! Your backup of the project "${projectName}" has been completed.
    Please note that this link will expire in 7 days.
    If you have any questions about Arbimon, check out our <a href="https://help.arbimon.org/">support docs</a>.
  </p>
  <div style="text-align:center;vertical-align:middle;align-items:center;display:inline-flex;display: -webkit-inline-flex;">
    <img style="width: 14px; height: 14px; margin-left:8px" src="https://static.rfcx.org/arbimon/download-icon.png">
    <a style="margin-left: 1px" href="${url}">Download export</a>
  </div>
  <p style="color:black;">
    <span> - The Arbimon Team </span>
  </p>
`

const exportDetectionsSubject = 'Arbimon CNN export detections ready'
const exportDetectionsBody = ({ url, jobId }: { url: string, jobId: number }): string => `
  <p style="color:black;margin-top:0">Hello,</p>
  <p style="color:black;">
    Thanks so much for using Arbimon! Your classifier job export id ${jobId} has been completed.
    Please note that this link will expire in 7 days.
    If you have any questions about Arbimon, check out our <a href="https://help.arbimon.org/">support docs</a>.
  </p>
  <button style="background:#ADFF2C;border:1px solid #ADFF2C;padding:6px 14px;;border-radius:9999px;cursor:pointer;margin: 10px 0">
      <a style="text-decoration:none;color:#14130D;white-space:nowrap;text-align:center;vertical-align:middle;align-items:center;display:inline-flex;display: -webkit-inline-flex;" href="${url}">
          Download
          <img style="width: 14px; height: 14px; margin-left:8px" src="https://static.rfcx.org/arbimon/download-icon.png">
      </a>
  </button>
  <p style="color:black;">
    <span> - The Arbimon Team </span>
  </p>
`

const projectBackupFailedSubject = 'Arbimon project backup failed'
const projectBackupFailedBody = ({ projectName }: { projectName: string }): string => `
  <p style="color:black;margin-top:0">Hello,</p>
  <p style="color:black;">
    There was an issue with your project backup of '${projectName}'. Our engineering team is looking into this and will update you when we have resolved it. We apologize for the inconvenience and thank you for your patience!
  </p>
  <p style="color:black;">
    All the best, <br>Arbimon team
  </p>
`

const bodyMapping: Record<MailTemplate, (content: Record<string, unknown>) => string> = {
  'project-backup': projectBackupBody as (content: Record<string, unknown>) => string,
  'export-detections': exportDetectionsBody as (content: Record<string, unknown>) => string,
  'project-backup-failed': projectBackupFailedBody as (content: Record<string, unknown>) => string
}

const subjectMapping: Record<MailTemplate, string> = {
  'project-backup': projectBackupSubject,
  'export-detections': exportDetectionsSubject,
  'project-backup-failed': projectBackupFailedSubject
}

export const generateBody = (template: MailTemplate, content: Record<string, unknown>): string =>
  bodyMapping[template](content)

export const generateSubject = (template: MailTemplate): string =>
  subjectMapping[template]
