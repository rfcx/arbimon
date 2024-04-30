import archiver from 'archiver'
import fs from 'fs'

export const createZip = async (zipPath: string, files: ZipFile[]): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipPath)
        const archive = archiver('zip', {
            zlib: { level: 9 }
        })

        output.on('end', () => { console.info('Data has been drained') })
        output.on('close', () => {
            console.info(`Created: "${zipPath}", total bytes: ${archive.pointer()}.`)
            resolve()
        })

        archive.on('error', (err) => {
            reject(err)
        })

        archive.pipe(output)
        for (const { name, content } of files) {
            archive.append(content, { name })
        }
        archive.finalize().catch(reject)
    })
}

export interface ZipFile {
    name: string
    content: string | Buffer
}
