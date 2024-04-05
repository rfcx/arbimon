import {GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3'

import { type ImageVariant, buildVariantPath } from '@/api-bio/_helpers'
import type {Readable} from "node:stream";
import type {PutObjectRequest} from "@aws-sdk/client-s3/dist-types/models/models_0";

interface S3Credentials {
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucketName: string
    endpoint?: string
}
export class StorageClient {
    private readonly client: S3Client
    private readonly credentials: S3Credentials

    constructor (credentials: S3Credentials) {
        const { accessKeyId, secretAccessKey, region, endpoint, bucketName } = credentials
        if (accessKeyId === undefined || secretAccessKey === undefined || region === undefined || bucketName === undefined) {
            // TODO create better error
            throw new Error('Insufficient S3 credentials')
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

    public getObjectPublicUrl (key: string, variant?: ImageVariant): string {
        const fileKey: string = variant !== undefined ? buildVariantPath(key, variant) : key
        const { endpoint, bucketName } = this.credentials
        if (endpoint !== undefined) {
            return `${endpoint.endsWith('/') ? endpoint : endpoint + '/'}${bucketName}/${fileKey}`
        }
        return `https://${bucketName}.s3.amazonaws.com/${fileKey}`
    }

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

    public async getObject (key: string): Promise<Buffer> {
        const { bucketName } = this.credentials

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        })

        const response = await this.client.send(command)
        const stream = response.Body as Readable

        return await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = []

            stream.on('data', chunk => chunks.push(chunk))
            // TODO fix error
            stream.once('error', () => { reject(new Error('Cannot parse image from AWS S3 into file correctly')) })
            stream.once('end', () => { resolve(Buffer.from(Buffer.concat(chunks))) })
        })
    }

    public async putObject (key: string, body: Buffer, mimetype: string, isPublic: boolean, options?: Partial<PutObjectRequest>): Promise<void> {
        const { bucketName } = this.credentials
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType: mimetype,
            ACL: isPublic ? 'public-read' : undefined,
            ...(options ?? {})
        })
        await this.client.send(command)
    }
}
