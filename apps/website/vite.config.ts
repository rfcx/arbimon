import pluginVue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pluginAutoImport from 'unplugin-auto-import/vite'
import pluginIconsResolver from 'unplugin-icons/resolver'
import pluginIcons from 'unplugin-icons/vite'
import { ElementPlusResolver as pluginElementPlusResolver } from 'unplugin-vue-components/resolvers'
import pluginComponents from 'unplugin-vue-components/vite'
import type { UserConfig as UserConfigVite } from 'vite'
import { defineConfig } from 'vite'
import pluginWindiCSS from 'vite-plugin-windicss'
import pluginTsConfigPaths from 'vite-tsconfig-paths'
import type { UserConfig as UserConfigVitest } from 'vitest'
import { type RouteRecordRaw } from 'vue-router'

import { ROUTE_NAMES } from './src/_services/router/route-names'

const STATIC_ROUTES = [
  ROUTE_NAMES.landingHome,
  ROUTE_NAMES.landingFeatured,
  ROUTE_NAMES.landingHowItWorks,
  ROUTE_NAMES.landingFAQ,
  ROUTE_NAMES.landingPublications,
  ROUTE_NAMES.landingTeam,
  ROUTE_NAMES.landingContact,
  ROUTE_NAMES.callback
]

const flattenRoutes = (route: RouteRecordRaw, pathPrefix = ''): Array<{ path: string, name: string | symbol | undefined }> =>
  [{ path: pathPrefix + route.path, name: route.name }].concat(route.children?.flatMap(r => flattenRoutes(r, pathPrefix + route.path)) ?? [])

// https://vitejs.dev/config/
const config: UserConfigVite & { test: UserConfigVitest } = {
  // Vite aliases are needed for imports in .vue files
  // TODO: Find a way to reuse tsconfig aliases
  resolve: {
    alias: {
      '@rfcx-bio/utils': resolve(__dirname, '../../packages/utils/src/'),
      '@rfcx-bio/common': resolve(__dirname, '../../packages/common/src/'),
      '~': resolve(__dirname, 'src/_services/'),
      '@': resolve(__dirname, 'src/')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/_styles/element-plus.scss" as *;'
      }
    }
  },
  plugins: [
    pluginAutoImport({
      resolvers: [pluginElementPlusResolver()],
      dts: true
    }),
    pluginComponents({
      resolvers: [
        pluginIconsResolver({
          customCollections: ['custom-icons'],
          prefix: 'icon',
          alias: { fas: 'fa-solid', far: 'fa-regular', custom: 'custom-icons' }
        }),
        pluginElementPlusResolver({ importStyle: 'sass', ssr: true })
      ]
    }),
    pluginIcons({
      compiler: 'vue3',
      customCollections: {
        'custom-icons': {
          download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>',
          'chevron-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376L277.76 489.6a32 32 0 000 44.672l331.648 340.352a29.12 29.12 0 0041.728 0 30.592 30.592 0 000-42.752L339.264 511.936l311.872-319.872a30.592 30.592 0 000-42.688 29.12 29.12 0 00-41.728 0z"></path></svg>',
          'chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.592 30.592 0 000 42.752L652.736 512 340.864 831.872a30.592 30.592 0 000 42.752 29.12 29.12 0 0041.728 0L714.24 534.336a32 32 0 000-44.672L382.592 149.376a29.12 29.12 0 00-41.728 0z"></path></svg>',
          linkout: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>',
          'angle-down': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>',
          'el-angle-down': '<svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1664 1312"><path fill="currentColor" d="m1619 552l-742 741q-19 19-45 19t-45-19L45 552q-19-19-19-45.5T45 461l166-165q19-19 45-19t45 19l531 531l531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z"></path></svg>',
          'image-slash': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path fill="currentColor" d="M19.5,4H10a1,1,0,0,0,0,2H19.5a1,1,0,0,1,1,1v6.76l-1.88-1.88a3,3,0,0,0-1.14-.71,1,1,0,1,0-.64,1.9.82.82,0,0,1,.36.23l3.31,3.29a.66.66,0,0,0,0,.15.83.83,0,0,0,0,.15,1.18,1.18,0,0,0,.13.18.48.48,0,0,0,.09.11.9.9,0,0,0,.2.14.6.6,0,0,0,.11.06.91.91,0,0,0,.37.08,1,1,0,0,0,1-1V7A3,3,0,0,0,19.5,4ZM3.21,2.29A1,1,0,0,0,1.79,3.71L3.18,5.1A3,3,0,0,0,2.5,7V17a3,3,0,0,0,3,3H18.09l1.7,1.71a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42ZM4.5,7a1,1,0,0,1,.12-.46L7.34,9.25a3,3,0,0,0-1,.63L4.5,11.76Zm1,11a1,1,0,0,1-1-1V14.58l3.3-3.29a1,1,0,0,1,1.4,0L15.91,18Z"/></svg>',
          'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19" stroke="#ADFF2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 5L19 12L12 19" stroke="#ADFF2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'arrow-right-white': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.75 9H14.25" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 3.75L14.25 9L9 14.25" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'ft-map-pin-sm': '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1876_5445)"><path d="M14 6.66663C14 11.3333 8 15.3333 8 15.3333C8 15.3333 2 11.3333 2 6.66663C2 5.07533 2.63214 3.5492 3.75736 2.42399C4.88258 1.29877 6.4087 0.666626 8 0.666626C9.5913 0.666626 11.1174 1.29877 12.2426 2.42399C13.3679 3.5492 14 5.07533 14 6.66663Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 8.66663C9.10457 8.66663 10 7.7712 10 6.66663C10 5.56206 9.10457 4.66663 8 4.66663C6.89543 4.66663 6 5.56206 6 6.66663C6 7.7712 6.89543 8.66663 8 8.66663Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_1876_5445"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>',
          'ft-map-pin-lg': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'ft-bird-lg': '<svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 16.5V22.5M14.5 16.5C17.7 14.9 18.1469 11.7657 18.5 10C19 7.5 18.5 5 18.5 5C18.3333 3.66667 17.3 1 14.5 1C11.7 1 11 3.16667 11 4.5C11 4.5 11 6.5 11 7C11 7.70403 10.5659 8.08122 10 8.5C7.29729 10.5 1 8.5 1 8.5C1.47368 11.4556 2.37841 14.738 5.5 16.5C6.32841 16.9602 7.17271 17.2528 8 17.4203M14.5 16.5C13.3452 17.1416 10.7678 17.9807 8 17.4203M8 17.4203V22.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6L22 7.5L19 9" stroke="white" stroke-width="2" stroke-linejoin="round"/><circle cx="15" cy="5.5" r="1" fill="white"/></svg>',
          'ft-search-sm': '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.0001 14L11.1001 11.1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'ft-search-lg': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.9999 21L16.6499 16.65" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'ft-mic-lg': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 23H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 19V23" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 1C11.2044 1 10.4413 1.31607 9.87868 1.87868C9.31607 2.44129 9 3.20435 9 4V12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12V4C15 3.20435 14.6839 2.44129 14.1213 1.87868C13.5587 1.31607 12.7956 1 12 1V1Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'fi-edit': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="Vector" d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="Vector_2" d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'fi-list': '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none"><path d="M8.5 18H21.5" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 18H3.51" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 12H21.5" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 12H3.51" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 6H21.5" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 6H3.51" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'fi-pm': '<svg width="33" height="30" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.52795 20.3159L20.4037 20.3159C22.3522 20.3159 23.9317 18.9855 23.9317 17.3442L23.9317 3.97173C23.9317 2.33052 22.3522 1.00006 20.4037 1.00006L4.52795 1.00006C2.57952 1.00006 1 2.33052 1 3.97173L1 17.3442C1 18.9855 2.57952 20.3159 4.52795 20.3159Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M25.3104 1.1416L21.9662 4.42684L18.622 7.71209L16.1377 4.85619" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M29.0414 11.6841H30.8054C31.741 11.6841 32.6384 11.9972 33.3 12.5545C33.9616 13.1118 34.3333 13.8677 34.3333 14.6558L34.3333 28.0283C34.3333 28.8165 33.9616 29.5723 33.3 30.1296C32.6384 30.6869 31.741 31 30.8054 31L14.9296 31C13.9939 31 13.0966 30.6869 12.435 30.1296C11.7734 29.5723 11.4017 28.8165 11.4017 28.0283V26.5425" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.43629 14.5142V11.5425" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.1377 24.915V21.9434" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.609 14.5141V10.0566" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M25.3104 24.915V20.4575" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.1953 14.5142V13.0283" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M29.8967 24.915V23.4292" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.0226 14.5141V7.08496" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.7241 24.915V21.9434" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'fi-soundscape': '<svg xmlns="http://www.w3.org/2000/svg" width="33" height="30" viewBox="0 0 36 32" fill="none"><path d="M1 22.4284V9.57129" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.1111 26.7144V11.7144" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.6667 28.8571V5.28564" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M23.2222 31V1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.7778 24.5713V9.57129" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M34.3333 28.8571V5.28564" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.55554 28.8571V5.28564" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'fi-aed': '<svg xmlns="http://www.w3.org/2000/svg" width="33" height="30" viewBox="0 0 36 32" fill="none"><path d="M13.1212 1V18.1429H34.3333" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.1212 18.1431L1 29.5716" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27.5152 12.4287C30.4439 12.4287 32.8182 10.1901 32.8182 7.42871C32.8182 4.66729 30.4439 2.42871 27.5152 2.42871C24.5864 2.42871 22.2121 4.66729 22.2121 7.42871C22.2121 10.1901 24.5864 12.4287 27.5152 12.4287Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M29.0303 30.9998C31.1223 30.9998 32.8182 29.4008 32.8182 27.4284C32.8182 25.4559 31.1223 23.8569 29.0303 23.8569C26.9383 23.8569 25.2424 25.4559 25.2424 27.4284C25.2424 29.4008 26.9383 30.9998 29.0303 30.9998Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.0303 18.143C5.70389 18.143 7.06061 16.8638 7.06061 15.2859C7.06061 13.7079 5.70389 12.4287 4.0303 12.4287C2.35671 12.4287 1 13.7079 1 15.2859C1 16.8638 2.35671 18.143 4.0303 18.143Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'fi-rfm': '<svg xmlns="http://www.w3.org/2000/svg" width="33" height="30" viewBox="0 0 36 32" fill="none"><path d="M1 30.1909L15.5342 8.78461" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M34.3333 30.1909L19.4863 8.57793" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M27.3201 22.8931L21.6607 30.1908" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M8.61719 22.8931L14.2766 30.1908" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M28.5447 22.8934C30.5457 22.8934 32.1678 21.2598 32.1678 19.2446C32.1678 17.2294 30.5457 15.5957 28.5447 15.5957C26.5437 15.5957 24.9215 17.2294 24.9215 19.2446C24.9215 21.2598 26.5437 22.8934 28.5447 22.8934Z" fill="#1E1C13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.8056 22.8934C8.80662 22.8934 10.4288 21.2598 10.4288 19.2446C10.4288 17.2294 8.80662 15.5957 6.8056 15.5957C4.80458 15.5957 3.18243 17.2294 3.18243 19.2446C3.18243 21.2598 4.80458 22.8934 6.8056 22.8934Z" fill="#1E1C13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.6751 8.29773C19.6761 8.29773 21.2983 6.66408 21.2983 4.64887C21.2983 2.63365 19.6761 1 17.6751 1C15.6741 1 14.0519 2.63365 14.0519 4.64887C14.0519 6.66408 15.6741 8.29773 17.6751 8.29773Z" fill="#1E1C13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          'fi-calendar': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14.25 3H3.75C2.92157 3 2.25 3.67157 2.25 4.5V15C2.25 15.8284 2.92157 16.5 3.75 16.5H14.25C15.0784 16.5 15.75 15.8284 15.75 15V4.5C15.75 3.67157 15.0784 3 14.25 3Z" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.25 7.5H15.75" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 1.5V4.5" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 1.5V4.5" stroke="#FFFEFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        }
      }
    }),
    pluginTsConfigPaths(),
    pluginVue({
      reactivityTransform: true
    }),
    pluginWindiCSS()
  ],
  server: {
    port: 8101, // Bio-1
    open: false
  },
  ssgOptions: {
    script: 'async',
    includedRoutes (paths, routes) {
      const allRoutes = routes.flatMap(r => flattenRoutes(r))
      return allRoutes.filter(r => (STATIC_ROUTES as string[]).includes(r.name?.toString() ?? '')).map(r => r.path)
    }
  },
  ssr: {
    noExternal: [
      'mapbox-gl',
      'siriwave',
      '@wysimark/vue'
    ]
  },
  assetsInclude: [
    '**/*.WAV'
  ],
  test: {
    deps: { inline: ['element-plus'] },
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./setup-component-tests.js']
  }
}

export default defineConfig(config)
