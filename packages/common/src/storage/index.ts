import {
    type GetObjectCommandOutput,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client
} from '@aws-sdk/client-s3'
import type { PutObjectRequest } from '@aws-sdk/client-s3/dist-types/models/models_0'
import type { Readable } from 'node:stream'

import { type ImageVariant, buildVariantPath } from '../api-bio/_helpers'

interface S3Credentials {
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucketName: string
    endpoint?: string
}

export interface GetObjectResponse {
    file: Buffer
    metadata: Partial<GetObjectCommandOutput>
}

/**
 * Client for interacting with storage (S3)
 */
export class StorageClient {
    private readonly client: S3Client
    private readonly credentials: S3Credentials

    constructor (credentials: S3Credentials) {
        const { accessKeyId, secretAccessKey, region, endpoint, bucketName } = credentials
        if (accessKeyId === undefined || secretAccessKey === undefined || region === undefined || bucketName === undefined) {
            throw new Error('Insufficient S3 credentials - please check if access key, secret, region or bucket is correct')
        }
        const endpointOptions = endpoint !== undefined && endpoint !== '' ? { endpoint, forcePathStyle: true } : {}
        this.client = new S3Client({
            ...endpointOptions,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        })
        this.credentials = credentials
    }

    /**
     * Checks if an object exists in storage (HeadObject operation)
     *
     * @param key {string} - path to object
     */
    public async objectExists (key: string): Promise<boolean> {
        try {
            const { bucketName } = this.credentials
            const command = new HeadObjectCommand({
                Bucket: bucketName,
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
     */
    public async getObject (key: string, metadata: boolean = false): Promise<Buffer | GetObjectResponse> {
        const { bucketName } = this.credentials

        const command = new GetObjectCommand({
            Bucket: bucketName,
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
     * @param options {Partial<PutObjectRequest>} - additional options
     */
    public async putObject (key: string, body: Buffer, options?: Partial<PutObjectRequest>): Promise<void> {
        const { bucketName } = this.credentials
        const { ContentType, ACL, ...rest } = options ?? {}
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType,
            ACL,
            ...(rest ?? {})
        })
        await this.client.send(command)
    }

    /**
     * Removes object from storage (S3)
     *
     * @param key {string} - path to object to be removed
     */
    public async deleteObject (key: string): Promise<void> {
        const { bucketName } = this.credentials
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
        })
        await this.client.send(command)
    }

    public getObjectPublicUrl (key: string, variant?: ImageVariant): string {
        const { endpoint, bucketName } = this.credentials
        const fileKey: string = variant !== undefined ? buildVariantPath(key, variant) : key
        if (endpoint !== undefined) {
            return `${endpoint.endsWith('/') ? endpoint : endpoint + '/'}${bucketName}/${fileKey}`
        }
        return `https://${bucketName}.s3.amazonaws.com/${fileKey}`
    }
}
