export interface WikiSummaryResponse {
  type: string
  title: string
  displaytitle: string
  namespace: {
    id: number
    text: string
  }
  wikibase_item: string
  titles: {
    canonical: string
    normalized: string
    display: string
  }
  pageid: number
  thumbnail: {
    source: string
    width: number
    height: number
  }
  originalimage: {
    source: string
    width: number
    height: number
  }
  lang: string
  dir: string
  revision: string
  tid: string
  timestamp: string
  description: string
  description_source: string
  content_urls: {
    desktop: {
      page: string
      revisions: string
      edit: string
      talk: string
    }
    mobile: {
      page: string
      revisions: string
      edit: string
      talk: string
    }
  }
  extract: string
  extract_html: string
}

export interface WikiSummary {
  type: string
  title: string
  displayTitle: string
  namespace: {
    id: number
    text: string
  }
  wikibaseItem: string
  titles: {
    canonical: string
    normalized: string
    display: string
  }
  pageId: number
  thumbnail: {
    source: string
    width: number
    height: number
  }
  originalImage: {
    source: string
    width: number
    height: number
  }
  lang: string
  dir: string
  revision: string
  tid: string
  timestamp: string
  description: string
  descriptionSource: string
  contentUrls: {
    desktop: {
      page: string
      revisions: string
      edit: string
      talk: string
    }
    mobile: {
      page: string
      revisions: string
      edit: string
      talk: string
    }
  }
  content: string
  contentHtml: string
}
