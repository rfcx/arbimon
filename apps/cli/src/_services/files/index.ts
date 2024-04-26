import archiver from 'archiver'
import fs from 'fs'

export const createZip = async (zipPath: string, files: ZipFile[]): Promise<void> => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', {
        // TODO set compression level
        zlib: { level: 0 }
    })
    for (const { name, content } of files) {
        archive.append(content, { name })
    }
    archive.pipe(output)
    output.end()

    await archive.finalize()
}

export interface ZipFile {
    name: string
    content: string | Buffer
}
