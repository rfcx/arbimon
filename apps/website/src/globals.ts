import { type Auth0Client } from '@auth0/auth0-spa-js'
import { type AxiosInstance } from 'axios'
import { type InjectionKey } from 'vue'

import { type FeatureToggles } from '~/feature-toggles'
import { type ROUTE_NAMES } from '~/router'
import { type BiodiversityStore } from '~/store'

export const authClientKey = Symbol('authClientKey') as InjectionKey<Auth0Client>
export const apiClientKey = Symbol('apiClientKey') as InjectionKey<AxiosInstance>
export const apiClientCoreKey = Symbol('apiClientCoreKey') as InjectionKey<AxiosInstance>
export const apiClientArbimonLegacyKey = Symbol('apiClientArbimonLegacyKey') as InjectionKey<AxiosInstance>
export const apiClientArbiAssistantKey = Symbol('apiClientArbiAssistantKey') as InjectionKey<AxiosInstance>
export const apiClientMediaKey = Symbol('apiClientMediaKey') as InjectionKey<AxiosInstance>
export const apiClientDeviceKey = Symbol('apiClientDevice') as InjectionKey<AxiosInstance>
export const storeKey = Symbol('storeKey') as InjectionKey<BiodiversityStore>
export const gtagKey = Symbol('gtagKey') as InjectionKey<AxiosInstance>
export const togglesKey = Symbol('togglesKey') as InjectionKey<FeatureToggles>
export const routeNamesKey = Symbol('routeNamesKey') as InjectionKey<typeof ROUTE_NAMES>
