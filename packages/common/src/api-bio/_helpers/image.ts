import path from 'path'

export const isS3image = (imagePath: string): boolean => {
    return imagePath.includes('s3.amazonaws.com')
}

export const buildThumbnailPath = (imagePath: string): string => {
    const extension = path.extname(imagePath)
    return imagePath.replace(extension, `.thumbnail${extension}`)
}
