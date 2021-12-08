import { createConfig } from '../../tools/configs/jest-config-factory.js'
import tsconfig from './tsconfig.build.json' // Must be the tsconfig that defines `paths`

export default createConfig(tsconfig)
