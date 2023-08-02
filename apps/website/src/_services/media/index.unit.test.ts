import { describe, expect, test } from 'vitest'

import { type GetMediaLinkOptions, getMediaLink } from './index'

describe('getMediaLink', () => {
  test('should produce correct string according to the format', () => {
    expect(() => {
      // Arrange
      const options: GetMediaLinkOptions = {
        streamId: 'z5384utmwc6n',
        start: '2023-02-20T23:20:31.372Z',
        end: '2023-02-20T23:20:34.372Z',
        filetype: 'spec',
        fileExtension: 'png',
        gain: 1,
        dimension: {
          width: 256,
          height: 256
        },
        windowFunction: 'dolph',
        contrast: 120
      }

      // Act
      const link = getMediaLink(options)

      // Assert
      expect(link).toContain('z5384utmwc6n')
      expect(link).toContain('t20230220T232031372Z.20230220232034372Z')
      expect(link).toContain('fspec')
      expect(link).toContain('g1')
      expect(link).toContain('.png')
      expect(link).toContain('d256.256')
      expect(link).toContain('wdolph')
      expect(link).toContain('z120')
    })
  })
})
