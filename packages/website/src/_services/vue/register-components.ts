import { App, Component } from 'vue'

type GlobEagerReturn = ReturnType<ImportMeta['globEager']>

export const componentsFromObj = (app: App, components: { [name: string]: Component }): void =>
  Object.entries(components)
    .forEach(([name, component]) => app.component(name, component))

export const componentsFromGlob = (app: App, glob: GlobEagerReturn): void =>
  Object.entries(glob)
    .forEach(pathAndImport => {
      const component = pathAndImport[1].default as Component
      const name = pathAndImport[0].match(/\/([^/]*)\./)?.[1] ?? '' // filename (without path & ext)
      app.component(name, component)
    })
