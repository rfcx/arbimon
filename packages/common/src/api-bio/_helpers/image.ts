import path from 'path'

export type ImageVariant = 'original' | 'thumbnail'
export const buildVariantPath = (imagePath: string, variant: ImageVariant): string => {
    if (variant !== 'original') {
        const extension = path.extname(imagePath)
        return imagePath.replace(extension, `.${variant}${extension}`)
    }

    return imagePath
}

export const isS3Image = (pathOrUrl: string): boolean => {
    if (pathOrUrl === '' || pathOrUrl === null || pathOrUrl === undefined) {
        return false
    }

    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('static://')) {
        return false
    }

    // Assume it's a storage path
    return true
}
