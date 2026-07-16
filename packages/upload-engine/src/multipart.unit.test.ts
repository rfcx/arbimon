import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { type MultipartDescriptor, uploadParts } from './multipart'

// Mock XMLHttpRequest for putPart.
class MockXhr {
  static behavior: (url: string) => { status: number, etag?: string } = () => ({ status: 200, etag: '"e"' })
  static calls: string[] = []
  upload = { onprogress: null as ((e: { lengthComputable: boolean, loaded: number, total: number }) => void) | null }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  status = 0
  private url = ''
  private readonly headers = new Map<string, string>()
  open (_method: string, url: string): void { this.url = url }
  setRequestHeader (): void {}
  getResponseHeader (name: string): string | null { return this.headers.get(name.toLowerCase()) ?? null }
  send (_body: Blob): void {
    MockXhr.calls.push(this.url)
    const result = MockXhr.behavior(this.url)
    this.status = result.status
    if (result.etag !== undefined) this.headers.set('etag', result.etag)
    setTimeout(() => {
      if (this.status >= 200 && this.status < 300) this.onload?.()
      else this.onload?.()
    }, 0)
  }

  abort (): void { this.onabort?.() }
}

const descriptor: MultipartDescriptor = {
  uploadId: 'u1',
  multipartUploadId: 'mp1',
  partSizeBytes: 4,
  partCount: 3,
  partUrls: [
    { partNumber: 1, url: 'http://p/1' },
    { partNumber: 2, url: 'http://p/2' },
    { partNumber: 3, url: 'http://p/3' }
  ]
}

const originalXhr = globalThis.XMLHttpRequest

describe('uploadParts', () => {
  beforeEach(() => {
    MockXhr.calls = []
    MockXhr.behavior = () => ({ status: 200, etag: '"ok"' })
    ;(globalThis as Record<string, unknown>).XMLHttpRequest = MockXhr
  })
  afterEach(() => { (globalThis as Record<string, unknown>).XMLHttpRequest = originalXhr })

  test('uploads all parts and returns ordered etags', async () => {
    const file = new Blob(['0123456789']) // 10 bytes → parts of 4,4,2
    const parts = await uploadParts(file, descriptor)
    expect(parts).toHaveLength(3)
    expect(parts.map(part => part.partNumber)).toEqual([1, 2, 3])
    expect(parts.every(part => part.etag === '"ok"')).toBe(true)
    expect(MockXhr.calls).toHaveLength(3)
  })

  test('skips already-completed parts (resume)', async () => {
    const file = new Blob(['0123456789'])
    const parts = await uploadParts(file, descriptor, {
      completedParts: [{ partNumber: 1, etag: '"prev"' }, { partNumber: 2, etag: '"prev"' }]
    })
    expect(parts).toHaveLength(3)
    expect(MockXhr.calls).toHaveLength(1)
    expect(MockXhr.calls[0]).toBe('http://p/3')
    expect(parts.find(part => part.partNumber === 1)?.etag).toBe('"prev"')
  })

  test('retries a failing part then succeeds', async () => {
    const file = new Blob(['0123456789'])
    let failures = 0
    MockXhr.behavior = (url) => {
      if (url === 'http://p/2' && failures < 2) {
        failures++
        return { status: 500 }
      }
      return { status: 200, etag: '"ok"' }
    }
    const parts = await uploadParts(file, descriptor, { retryBaseDelayMs: 1, retryMaxDelayMs: 2 })
    expect(parts).toHaveLength(3)
    expect(failures).toBe(2)
  })

  test('throws after exhausting per-part attempts', async () => {
    const file = new Blob(['0123456789'])
    MockXhr.behavior = (url) => url === 'http://p/2' ? { status: 500 } : { status: 200, etag: '"ok"' }
    await expect(uploadParts(file, descriptor, { maxAttemptsPerPart: 2, retryBaseDelayMs: 1, retryMaxDelayMs: 2 })).rejects.toBeDefined()
  })

  test('reports aggregated byte progress', async () => {
    const file = new Blob(['0123456789'])
    const snapshots: number[] = []
    await uploadParts(file, descriptor, {
      onProgress: (loaded, total) => { snapshots.push(loaded); expect(total).toBe(10) }
    })
    expect(snapshots[snapshots.length - 1]).toBe(10)
  })

  test('missing ETag header rejects with guidance', async () => {
    const file = new Blob(['0123456789'])
    MockXhr.behavior = () => ({ status: 200 }) // no etag
    await expect(uploadParts(file, descriptor, { maxAttemptsPerPart: 1 })).rejects.toThrow(/ETag/)
  })
})
