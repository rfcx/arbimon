import { Blob as NodeBlob } from 'buffer'

globalThis.Blob = NodeBlob // use Node.js Blob instead of happy-dom's Blob
