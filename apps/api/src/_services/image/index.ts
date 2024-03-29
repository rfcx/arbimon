import sharp from 'sharp'

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
