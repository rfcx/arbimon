import archiver from 'archiver'
import fs from 'fs'

export const createZip = async (zipPath: string, files: ZipFile[]): Promise<void> => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', {
        // TODO set compression level
        zlib: { level: 0 }
    })

    archive.pipe(output)
    for (const { name, content } of files) {
        archive.append(content, { name })
    }
    output.end()

    await archive.finalize()

    return new Promise((resolve, reject) => {
        output.on('end', () => { resolve() })
    })
}

export interface ZipFile {
    name: string
    content: string | Buffer
}
