import 'vite/client'

declare global {
  interface ImportMetaEnv extends Readonly<Record<string, string>> {
    readonly VITE_BIO_API_HOST: string

    readonly VITE_TOGGLE_AO_LINE: string
  }
}
