export const PROJECT_IMAGE_CONFIG = {
    thumbnail: {
        width: 144,
        height: 144,
        CacheControl: 'max-age=604800, s-maxage=604800', // 7 days
        ACL: 'public-read' as 'public-read'
    }
}

export const BATCH_LIMIT = 1000
export const VERBOSE = true
