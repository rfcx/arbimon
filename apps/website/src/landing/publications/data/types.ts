export interface Publication {
  type: 'Use' | 'Mention' | 'Co-author'
  author: string
  year: number
  title: string
  journal: string
  doiUrl: string
  isRFCxAuthor: boolean
  orgMention: string
  uses: string
  citations: number
}
