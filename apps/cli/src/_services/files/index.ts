import archiver from 'archiver'
import fs from 'node:fs'

export interface CreateZipResult {
  totalBytes: number
}

export const createZip = async (zipPath: string, files: string[]): Promise<CreateZipResult> =>
  await new Promise<CreateZipResult>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    output.on('close', () => {
      resolve({ totalBytes: archive.pointer() })
    })

    archive.on('error', (err) => {
      reject(err)
    })

    archive.pipe(output)
    for (const file of files) {
      const content = fs.readFileSync(file)
      archive.append(content, { name: file })
    }
    archive.finalize().catch(reject)
  })

export interface ZipFile {
  name: string
  content: string | Buffer
}
