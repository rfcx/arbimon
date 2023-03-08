import { type App, type Component } from 'vue'

type GlobEagerReturn = ReturnType<ImportMeta['globEager']>

export const componentsFromObj = (app: App, components: Record<string, Component>): void => {
 Object.entries(components)
    .forEach(([name, component]) => app.component(name, component))
}

export const componentsFromGlob = (app: App, glob: GlobEagerReturn): void => {
 Object.entries(glob)
    .forEach(pathAndImport => {
      const component = (pathAndImport[1] as { default: Component }).default
      const name = pathAndImport[0].match(/\/([^/]*)\./)?.[1] ?? '' // filename (without path & ext)
      app.component(name, component)
    })
}
