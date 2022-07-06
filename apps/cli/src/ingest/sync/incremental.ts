import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '../_connections/arbimon'
import { syncAllIncrementally } from './sync-all'

const arbimonSequelize = getArbimonSequelize()
const biodiversitySequelize = getSequelize()
await syncAllIncrementally(arbimonSequelize, biodiversitySequelize)
