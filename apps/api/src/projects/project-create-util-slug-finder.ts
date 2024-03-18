import { PROJECT_SLUG_MAX_LENGTH, slugify } from '@rfcx-bio/utils/string/slug'

// Good enough solution as only used to generate extra 4 chars to suffix to the slug if needed
const fourRandomChars = (): string => (Math.random().toString(36) + '000000').slice(2, 6)

// Generate slug from input and keep adding a suffix until it meets the `isUnique` test
export async function uniqueSlug (input: string, isUnique: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = slugify(input)
  while (slug.length > PROJECT_SLUG_MAX_LENGTH) {
    const to = slug.lastIndexOf('-')
    slug = slug.substring(0, to > 0 ? to : PROJECT_SLUG_MAX_LENGTH)
  }
  while (!await isUnique(slug)) {
    slug = slug.substring(0, PROJECT_SLUG_MAX_LENGTH - 5) + '-' + fourRandomChars()
  }
  return slug
}
