import sharp, { type Metadata } from 'sharp'

interface ResizeOptions {
    height: number
    width: number
}
export const resizeImage = async (file: Buffer, options: ResizeOptions): Promise<Buffer> => {
    const { width, height } = options
    if (width && height) {
        return await sharp(file).resize(width, height).toBuffer()
    }

    return file
}

export const getMetadata = async (file: Buffer): Promise<Metadata> => {
    const image = sharp(file)
    return await image.metadata()
}
