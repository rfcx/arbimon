import 'vite/client'

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_BIO_API_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
