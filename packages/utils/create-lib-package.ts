import fs from 'fs/promises'

// Read dev package.json
const packageJson = await fs.readFile('package.json', 'utf8')
const { name, version, license, private: privateVar, type, dependencies, peerDependencies: peerDeps, description } = JSON.parse(packageJson)

// Create & write lib package.json
// (strip unneeded fields & update file paths)
const files = ['**/*.js']
const peerDependencies = peerDeps ?? {}
const libPackageJson = { name, version, license, private: privateVar, type, dependencies, peerDependencies, description, files }
await fs.writeFile('./lib/package.json', JSON.stringify(libPackageJson, null, 2))
