import sharp, { type Metadata } from 'sharp'

interface ResizeOptions {
    height: number
    width: number
}

// Formats we will store for profile/thumbnail images. Anything else that sharp
// can decode (tiff, gif, svg, ...) is normalised to jpeg on ingest.
export type StoredImageFormat = 'png' | 'jpeg'

export interface ImageFormatInfo {
    /** the format we will store, derived from the BYTES, not the filename */
    format: StoredImageFormat
    /** canonical extension including the dot, e.g. '.png' */
    extension: string
    /** truthful Content-Type for the stored bytes */
    contentType: string
}

/**
 * Derive the storage format for an uploaded image from its actual bytes.
 *
 * Never trust `file.filename` / `file.mimetype` for this: the client-side
 * canvas downscale historically transcoded JPEG->PNG while keeping the
 * original filename, which mislabelled ~42% of the profile-image bucket
 * (extension says .jpg, bytes are PNG; see rfcx-local
 * runbooks/FINDING-profile-image-format-mislabelling-2026-08-17.md).
 *
 * PNG stays PNG (it is the only stored format with alpha); everything else
 * becomes JPEG.
 */
export const getStoredImageFormat = async (file: Buffer): Promise<ImageFormatInfo> => {
    const metadata = await sharp(file).metadata()
    if (metadata.format === 'png') {
        return { format: 'png', extension: '.png', contentType: 'image/png' }
    }
    return { format: 'jpeg', extension: '.jpg', contentType: 'image/jpeg' }
}

export const resizeImage = async (file: Buffer, options: ResizeOptions): Promise<Buffer> => {
    const { width, height } = options
    if (width && height) {
        return await sharp(file).resize(width, height).toBuffer()
    }

    return file
}

/**
 * Resize AND normalise to an explicit output format. Unlike `resizeImage`,
 * the output format cannot silently follow the input: sharp otherwise emits
 * the input's format, and callers then label it with whatever mimetype the
 * client claimed - the exact mislabelling bug this replaces.
 */
export const resizeImageToFormat = async (file: Buffer, options: ResizeOptions, format: StoredImageFormat): Promise<Buffer> => {
    const { width, height } = options
    const base = (width && height) ? sharp(file).resize(width, height) : sharp(file)
    return await base.toFormat(format).toBuffer()
}

export const getMetadata = async (file: Buffer): Promise<Metadata> => {
    const image = sharp(file)
    return await image.metadata()
}
