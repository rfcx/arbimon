import { type GetObjectCommandOutput, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Readable } from 'node:stream'
import { parse } from 'path'

import { type ImageVariant, buildVariantPath } from '../api-bio/_helpers'

interface S3Credentials {
    accessKeyId: string
    secretAccessKey: string
    region: string
    defaultBucketName: string
    endpoint?: string
}

export interface GetObjectResponse {
    file: Buffer
    metadata: Partial<GetObjectCommandOutput>
}

export interface PutObjectOptions {
    ACL?: 'public-read'
    CacheControl?: string
    ContentType?: string
}

/**
 * Client for interacting with storage (S3)
 */
export class StorageClient {
    private readonly client: S3Client
    private readonly defaultBucket: string
    private readonly endpoint?: string

    constructor (credentials: S3Credentials) {
        const { accessKeyId, secretAccessKey, region, endpoint } = credentials
        const endpointOptions = endpoint !== undefined && endpoint !== '' ? { endpoint, forcePathStyle: true } : {}
        this.client = new S3Client({
            ...endpointOptions,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        })
        this.defaultBucket = credentials.defaultBucketName
        this.endpoint = endpoint
    }

    /**
     * Checks if an object exists in storage (HeadObject operation)
     *
     * @param key {string} - path to object
     * @param bucket {string} - specific bucket name else the default bucket
     */
    public async objectExists (key: string, bucket?: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: bucket ?? this.defaultBucket,
                Key: key
            })
            await this.client.send(command)
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * Fetches object from storage (S3)
     *
     * @param key {string} - path to object
     * @param metadata {boolean} - flag for returning file metadata; default is false
     * @param bucket {string} - specific bucket name else the default bucket
     */
    public async getObject (key: string, metadata: boolean = false, bucket?: string): Promise<Buffer | GetObjectResponse> {
        const command = new GetObjectCommand({
            Bucket: bucket ?? this.defaultBucket,
            Key: key
        })

        const response = await this.client.send(command)
        const stream = response.Body as Readable

        const file = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = []

            stream.on('data', chunk => chunks.push(chunk))
            stream.once('error', () => { reject(new Error('Cannot parse image from AWS S3 into file correctly')) })
            stream.once('end', () => { resolve(Buffer.from(Buffer.concat(chunks))) })
        })

        if (metadata) {
            return {
                file,
                metadata: {
                    ContentType: response.ContentType
                }
            }
        }

        return file
    }

    /**
     * Stores object in storage (S3)
     *
     * @param key {string} - path to object
     * @param body {Buffer} - file/buffer to store
     * @param options {PutObjectOptions} - additional options
     * @param bucket {string} - specific bucket name else the default bucket
     */
    public async putObject (key: string, body: Buffer, options?: PutObjectOptions, bucket?: string): Promise<void> {
        const { ContentType, ACL } = options ?? {}
        const command = new PutObjectCommand({
            Bucket: bucket ?? this.defaultBucket,
            Key: key,
            Body: body,
            ContentType,
            ACL
        })
        await this.client.send(command)
    }

    /**
     * Removes object from storage (S3)
     *
     * @param key {string} - path to object to be removed
     * @param bucket {string} - specific bucket name else the default bucket
     */
    public async deleteObject (key: string, bucket?: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: bucket ?? this.defaultBucket,
            Key: key
        })
        await this.client.send(command)
    }

    /**
     * Get the public URL for an object (only works for objects with ACL `public-read`)
     *
     * @param key {string} - path to object
     * @param variant {ImageVariant} - (for images) get a variant (e.g. 'thumbnail'); default is undefined ('original')
     * @param bucket {string} - specific bucket name else the default bucket
     */
    public getObjectPublicUrl (key: string, variant?: ImageVariant, bucket?: string): string {
        const bucketName = bucket ?? this.defaultBucket
        const fileKey: string = variant !== undefined ? buildVariantPath(key, variant) : key
        if (this.endpoint !== undefined) {
            return `${this.endpoint.endsWith('/') ? this.endpoint : this.endpoint + '/'}${bucketName}/${fileKey}`
        }
        return `https://${bucketName}.s3.amazonaws.com/${fileKey}`
    }

    /**
     * Generate a signed URL for an object
     *
     * @param key {string} - path to object
     * @param bucket {string} - specific bucket name else the default bucket
     * @param expiresIn {number} - number of seconds the link will be valid for; default is one week
     */
    public async getObjectSignedUrl (key: string, bucket?: string, expiresIn: number = ONE_WEEK_IN_SECONDS): Promise<string> {
        const parsedPath = parse(key)
        const command = new GetObjectCommand({
            Bucket: bucket ?? this.defaultBucket,
            Key: key,
            ResponseContentDisposition: `attachment; filename=${parsedPath.base}`
        })
        return await getSignedUrl(this.client, command, { expiresIn })
    }
}

export const ONE_WEEK_IN_SECONDS = 86400 * 7
