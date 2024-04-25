import archiver from 'archiver'
import fs from 'fs'

export const createZip = (zipPath: string, files: ZipFiles[]): void => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', {
        // TODO fix compression level
        zlib: { level: 0 }
    })
    archive.pipe(output)
    for (const file of files) {
        const { name, content } = file
        archive.append(content, { name })
    }
    archive.finalize()
}

export interface ZipFile {
    name: string
    content: string | string[] | File | Buffer | ArrayBuffer
}
