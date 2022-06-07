import { Auth0Client } from '@auth0/auth0-spa-js'
import { AxiosInstance } from 'axios'
import { InjectionKey } from 'vue'

import { FeatureToggles } from '~/feature-toggles'
import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

export const authClientKey = Symbol('authClientKey') as InjectionKey<Auth0Client>
export const apiClientBioKey = Symbol('apiClientBioKey') as InjectionKey<AxiosInstance>
export const apiClientCoreKey = Symbol('apiClientCoreKey') as InjectionKey<AxiosInstance>
export const storeKey = Symbol('storeKey') as InjectionKey<BiodiversityStore>
export const gtagKey = Symbol('gtagKey') as InjectionKey<AxiosInstance>
export const togglesKey = Symbol('togglesKey') as InjectionKey<FeatureToggles>
export const routeNamesKey = Symbol('routeNamesKey') as InjectionKey<typeof ROUTE_NAMES>
