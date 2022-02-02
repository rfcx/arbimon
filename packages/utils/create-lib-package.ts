import fs from 'fs/promises'

// Read dev package.json
const packageJson = await fs.readFile('package.json', 'utf8')
const { name, version, license, private: privateVar, type, dependencies: deps, peerDependencies: peerDeps, description } = JSON.parse(packageJson)

// Update file paths
const files = ['**/*.js']

// Move packages to peerDeps
const packagePrefix = '@rfcx-bio/'
const dependencies = Object.fromEntries(Object.entries(deps).filter(([key]) => !key.startsWith(packagePrefix)))
const peerDependencies = { ...peerDeps, ...Object.fromEntries(Object.keys(deps).filter(k => k.startsWith(packagePrefix)).map(k => [k, '*'])) }

// Reassemble select fields
const libPackageJson = { name, version, license, private: privateVar, type, dependencies, peerDependencies, description, files }
await fs.writeFile('./lib/package.json', JSON.stringify(libPackageJson, null, 2))
