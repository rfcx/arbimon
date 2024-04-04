import path from 'path'

export type ImageVariant = 'original' | 'thumbnail'
export const buildVariantPath = (imagePath: string, variant: ImageVariant): string => {
    if (variant !== 'original') {
        const extension = path.extname(imagePath)
        return imagePath.replace(extension, `.${variant}${extension}`)
    }

    return imagePath
}
