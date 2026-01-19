<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] isolate flex items-center justify-center ml-120"
  >
    <div class="bg-moss rounded-xl shadow-lg max-w-xl w-full p-6">
      <div class="flex flex-col gap-y-2">
        <div class="flex flex-row items-center justify-between">
          <h2 class="text-2xl font-header">
            Edit {{ props.soundscape.name }} Visualization
          </h2>
          <button
            type="button"
            title="Cancel"
            @click="$emit('cancel')"
          >
            <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
          </button>
        </div>
        <div class="grid grid-cols-[100px_1fr] items-center py-2 border-b border-[#3a392f]">
          <div class="font-semibold">
            Scale
          </div>
          <div class="flex flex-row items-start items-center gap-x-5">
            <div class="font-medium">
              0 -
              <input
                v-model.number="currentMaxValue"
                type="number"
                :min="0"
                class="w-20 text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 input-hide-arrows disabled:(text-util-gray-02 cursor-not-allowed)"
                :disabled="isNormalize"
              >
              (default: {{ soundscape.max_value }})
            </div>
            <div class="flex flex-row items-start items-center gap-x-2 relative">
              <input
                id="normalizeCheckbox"
                type="checkbox"
                class="w-5 h-5 border-2 mb-1 cursor-pointer rounded dark:bg-echo focus:ring-frequency border-white dark:focus:ring-frequency dark:ring-offset-gray-800"
                :checked="isNormalize"
                @click="onSelectNormalize()"
              >
              <label
                for="normalizeCheckbox"
                class="font-semibold"
              >
                Normalize data
              </label>
              <div
                title="Check to normalize each value in the soundscape using the number of recordings in the playlist that fall in that column. Note: This overrides the scale parameter."
              >
                <icon-fas-info-circle
                  data-tooltip-target="tooltipIdNormalizeData"
                  data-tooltip-style="light"
                  class="inline-block cursor-pointer h-4 w-4 text-insight"
                />
              </div>
              <div
                id="tooltipIdNormalizeData"
                role="tooltip"
                class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
              >
                Check to normalize each value in the soundscape <br> using the number of recordings in the playlist <br> that fall in that column. <br> Note: This overrides the scale parameter.
                <div
                  class="tooltip-arrow"
                  data-popper-arrow
                />
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-[100px_1fr] items-center py-2 border-b border-[#3a392f]">
          <label
            for="amplitudeThresholdRange"
            class="font-semibold"
          >
            Amplitude
          </label>
          <div
            class="flex flex-row items-start items-center gap-x-5"
          >
            <input
              id="amplitudeThresholdRange"
              v-model="amplitudeThreshold"
              type="range"
              min="0"
              max="1"
              step="0.001"
              class="w-20 h-1 accent-frequency appearance-none custom-slider"
            >
            <input
              id="amplitudeThresholdNumber"
              v-model="amplitudeThreshold"
              type="number"
              min="0"
              max="1"
              step="0.001"
              class="w-20 cursor-pointer text-center bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
            >
            <select
              id="amplitudeReference"
              v-model="selectedAmplitudeReference"
              class="bg-pitch border cursor-pointer border-frequency w-40 text-insight text-base rounded-md block text-ellipsis overflow-hidden pl-2 pr-5 font-sans border border-1 focus:border-frequency focus:outline-none focus:ring-0"
            >
              <option
                v-for="aref in amplitudeReferences"
                :key="aref.value"
                :value="aref.value"
                class="w-50"
                :label="aref.caption + ' (' + aref.description + ')'"
              />
            </select>
          </div>
        </div>
        <div class="grid grid-cols-[100px_1fr] items-center py-2 border-b border-[#3a392f]">
          <label
            for="amplitudeThresholdRange"
            class="font-semibold"
          >
            Colors
          </label>
          <div class="flex flex-row items-start items-center relative">
            <button
              id="dropdownColorButton"
              data-dropdown-toggle="dropdownColorMenu"
              data-dropdown-placement="left"
              class="border-1 border-frequency rounded-md bg-moss text-frequency px-3 py-2 flex items-center gap-2"
              @focusin="openDropdown"
            >
              <SidebarSoundscapePalette
                :selected-palette="palettes[selectedPalette]"
              />
              <span>
                <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
                <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
              </span>
            </button>
            <div
              id="dropdownColorMenu"
              class="absolute hidden left-4 z-60 bg-moss border-1 border-frequency rounded-lg"
            >
              <ul
                aria-labelledby="dropdownColorButton"
                class="p-2 flex flex-col font-medium"
              >
                <li
                  v-for="(palette, idx) in palettes"
                  :key="idx"
                  class="bg-moss text-frequency px-3 py-2 flex cursor-pointer items-center gap-2"
                  @click="selectPalette(idx)"
                >
                  <SidebarSoundscapePalette
                    :selected-palette="palette"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="flex flex-row justify-center items-center py-2">
          <SidebarSoundscapeDrawer
            :normalized="isNormalize"
            :amplitude-threshold="amplitudeThreshold"
            :amplitude-threshold-type="selectedAmplitudeReference"
            :palette="palettes[selectedPalette]"
            :visual-max="currentMaxValue"
            :soundscape-scidx="soundscapeScidx"
            :soundscape-norm-vector="soundscapeNormVector"
          />
        </div>
        <div class="flex flex-row justify-between items-center gap-x-4 mt-4">
          <button
            class="btn-primary px-4 py-2 btn btn-medium w-full"
            @click="updateOptions"
          >
            Save & close
          </button>
          <button
            class="px-4 py-2 btn btn-secondary btn-medium w-full"
            @click="$emit('cancel')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initDropdowns, initTooltips } from 'flowbite'
import { nextTick, onMounted, ref, watch } from 'vue'

import { type NormVector, type SoundscapeItem, type SoundscapeItemOptions, type SoundscapeScidx } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import SidebarSoundscapeDrawer from './sidebar-soundscape-drawer.vue'
import SidebarSoundscapePalette from './sidebar-soundscape-palette.vue'

const props = defineProps<{
  soundscape: SoundscapeItem
  visible: boolean
  soundscapeScidx: SoundscapeScidx | undefined
  soundscapeNormVector: NormVector | undefined
}>()

const emits = defineEmits<{(e: 'cancel'): void, (e: 'emitOptions', value: SoundscapeItemOptions): void}>()

const currentMaxValue = ref(0)
const isNormalize = ref<boolean>(false)
const amplitudeThreshold = ref(0)
const selectedAmplitudeReference = ref<string>('absolute')
const selectedPalette = ref(0)

const amplitudeReferences = [
  { value: 'absolute', caption: 'Absolute', description: 'The threshold is taken as an absolute value of the amplitude of each peak.' },
  { value: 'relative-to-peak-maximum', caption: 'Relative to maximum', description: 'The threshold is taken as a relative proportion of the maximum amplitude of the peaks in the soundscape.' }
]

const palettes: string[][] = [
  ['#4400e5', '#4000e5', '#3c00e5', '#3700e5', '#3300e5', '#2f00e5', '#2a00e5', '#2600e5', '#2200e5', '#1d00e5', '#1900e5', '#1500e5', '#1100e5', '#0c00e5', '#0800e5', '#0400e5', '#0000e5', '#0004e5', '#0008e5', '#000de5', '#0011e5', '#0015e5', '#001ae5', '#001ee5', '#0022e5', '#0027e5', '#002be5', '#002fe5', '#0034e5', '#0038e5', '#003ce5', '#0041e5', '#0045e5', '#0049e5', '#004ee5', '#0052e5', '#0056e5', '#005ae5', '#005fe5', '#0063e5', '#0067e5', '#006ce5', '#0070e5', '#0074e5', '#0079e5', '#007de5', '#0081e5', '#0086e5', '#008ae5', '#008ee5', '#0093e5', '#0097e5', '#009be5', '#00a0e5', '#00a4e5', '#00a8e5', '#00ade5', '#00b1e5', '#00b5e5', '#00bae5', '#00bee5', '#00c2e5', '#00c6e5', '#00cbe5', '#00e543', '#00e53f', '#00e53b', '#00e536', '#00e532', '#00e52e', '#00e529', '#00e525', '#00e521', '#00e51c', '#00e518', '#00e514', '#00e50f', '#00e50b', '#00e507', '#00e502', '#01e500', '#05e500', '#09e500', '#0ee500', '#12e500', '#16e500', '#1be500', '#1fe500', '#23e500', '#28e500', '#2ce500', '#30e500', '#35e500', '#39e500', '#3de500', '#42e500', '#46e500', '#4ae500', '#4fe500', '#53e500', '#57e500', '#5ce500', '#60e500', '#64e500', '#69e500', '#6de500', '#71e500', '#75e500', '#7ae500', '#7ee500', '#82e500', '#87e500', '#8be500', '#8fe500', '#94e500', '#98e500', '#9ce500', '#a1e500', '#a5e500', '#a9e500', '#aee500', '#b2e500', '#b6e500', '#bbe500', '#bfe500', '#c3e500', '#c8e500', '#cce500', '#e5e401', '#e5e303', '#e5e106', '#e5e008', '#e5df0b', '#e5de0d', '#e5dc10', '#e5db12', '#e5da15', '#e5d917', '#e5d81a', '#e5d71c', '#e5d51f', '#e5d422', '#e5d324', '#e5d227', '#e5d229', '#e5d12c', '#e5d02e', '#e5cf31', '#e5ce33', '#e5cd36', '#e5cd38', '#e5cc3b', '#e5cb3d', '#e5cb40', '#e5ca42', '#e5c945', '#e5c947', '#e5c84a', '#e5c84c', '#e5c74f', '#e5c751', '#e5c754', '#e5c656', '#e5c659', '#e5c65b', '#e5c55e', '#e5c561', '#e5c563', '#e5c566', '#e5c468', '#e5c46b', '#e5c46d', '#e5c470', '#e5c472', '#e5c475', '#e5c477', '#e5c47a', '#e5c47c', '#e5c57f', '#e5c581', '#e5c584', '#e5c586', '#e5c589', '#e5c68b', '#e5c68e', '#e5c690', '#e5c793', '#e5c795', '#e5c898', '#e5c89a', '#e5c99d', '#e5c9a0', '#916225', '#926328', '#93652a', '#95672c', '#96682f', '#986a31', '#996c33', '#9a6d36', '#9c6f38', '#9d713a', '#9f723d', '#a0743f', '#a27641', '#a37744', '#a47946', '#a67a48', '#a77c4b', '#a97e4d', '#aa7f4f', '#ab8152', '#ad8354', '#ae8456', '#b08659', '#b1885b', '#b2895d', '#b48b60', '#b58d62', '#b78e64', '#b89067', '#ba9269', '#bb936b', '#bc956e', '#be9670', '#bf9872', '#c19a75', '#c29b77', '#c39d79', '#c59f7c', '#c6a07e', '#c8a280', '#c9a483', '#caa585', '#cca787', '#cda98a', '#cfaa8c', '#d0ac8e', '#d2ad91', '#d3af93', '#d4b195', '#d6b298', '#d7b49a', '#d9b69c', '#dab79f', '#dbb9a1', '#ddbba3', '#debca6', '#e0bea8', '#e1c0aa', '#e2c1ad', '#e4c3af', '#e5c5b1', '#e7c6b4', '#e8c8b6', '#eacab9'],
  ['#ffffff', '#fefefe', '#fdfdfd', '#fcfcfc', '#fbfbfb', '#fafafa', '#f9f9f9', '#f8f8f8', '#f7f7f7', '#f6f6f6', '#f5f5f5', '#f4f4f4', '#f3f3f3', '#f2f2f2', '#f1f1f1', '#f0f0f0', '#efefef', '#eeeeee', '#ededed', '#ececec', '#ebebeb', '#eaeaea', '#e9e9e9', '#e8e8e8', '#e7e7e7', '#e6e6e6', '#e5e5e5', '#e4e4e4', '#e3e3e3', '#e2e2e2', '#e1e1e1', '#e0e0e0', '#dfdfdf', '#dedede', '#dddddd', '#dcdcdc', '#dbdbdb', '#dadada', '#d9d9d9', '#d8d8d8', '#d7d7d7', '#d6d6d6', '#d5d5d5', '#d4d4d4', '#d3d3d3', '#d2d2d2', '#d1d1d1', '#d0d0d0', '#cfcfcf', '#cecece', '#cdcdcd', '#cccccc', '#cbcbcb', '#cacaca', '#c9c9c9', '#c8c8c8', '#c7c7c7', '#c6c6c6', '#c5c5c5', '#c4c4c4', '#c3c3c3', '#c2c2c2', '#c1c1c1', '#c0c0c0', '#bfbfbf', '#bebebe', '#bdbdbd', '#bcbcbc', '#bbbbbb', '#bababa', '#b9b9b9', '#b8b8b8', '#b7b7b7', '#b6b6b6', '#b5b5b5', '#b4b4b4', '#b3b3b3', '#b2b2b2', '#b1b1b1', '#b0b0b0', '#afafaf', '#aeaeae', '#adadad', '#acacac', '#ababab', '#aaaaaa', '#a9a9a9', '#a8a8a8', '#a7a7a7', '#a6a6a6', '#a5a5a5', '#a4a4a4', '#a3a3a3', '#a2a2a2', '#a1a1a1', '#a0a0a0', '#9f9f9f', '#9e9e9e', '#9d9d9d', '#9c9c9c', '#9b9b9b', '#9a9a9a', '#999999', '#989898', '#979797', '#969696', '#959595', '#949494', '#939393', '#929292', '#919191', '#909090', '#8f8f8f', '#8e8e8e', '#8d8d8d', '#8c8c8c', '#8b8b8b', '#8a8a8a', '#898989', '#888888', '#878787', '#868686', '#858585', '#848484', '#838383', '#828282', '#818181', '#808080', '#7f7f7f', '#7e7e7e', '#7d7d7d', '#7c7c7c', '#7b7b7b', '#7a7a7a', '#797979', '#787878', '#777777', '#767676', '#757575', '#747474', '#737373', '#727272', '#717171', '#707070', '#6f6f6f', '#6e6e6e', '#6d6d6d', '#6c6c6c', '#6b6b6b', '#6a6a6a', '#696969', '#686868', '#676767', '#666666', '#656565', '#646464', '#636363', '#626262', '#616161', '#606060', '#5f5f5f', '#5e5e5e', '#5d5d5d', '#5c5c5c', '#5b5b5b', '#5a5a5a', '#595959', '#585858', '#575757', '#565656', '#555555', '#545454', '#535353', '#525252', '#515151', '#505050', '#4f4f4f', '#4e4e4e', '#4d4d4d', '#4c4c4c', '#4b4b4b', '#4a4a4a', '#494949', '#484848', '#474747', '#464646', '#454545', '#444444', '#434343', '#424242', '#414141', '#404040', '#3f3f3f', '#3e3e3e', '#3d3d3d', '#3c3c3c', '#3b3b3b', '#3a3a3a', '#393939', '#383838', '#373737', '#363636', '#353535', '#343434', '#333333', '#323232', '#313131', '#303030', '#2f2f2f', '#2e2e2e', '#2d2d2d', '#2c2c2c', '#2b2b2b', '#2a2a2a', '#292929', '#282828', '#272727', '#262626', '#252525', '#242424', '#232323', '#222222', '#212121', '#202020', '#1f1f1f', '#1e1e1e', '#1d1d1d', '#1c1c1c', '#1b1b1b', '#1a1a1a', '#191919', '#181818', '#171717', '#161616', '#151515', '#141414', '#131313', '#121212', '#111111', '#101010', '#0f0f0f', '#0e0e0e', '#0d0d0d', '#0c0c0c', '#0b0b0b', '#0a0a0a', '#090909', '#080808', '#070707', '#060606', '#050505', '#040404', '#030303', '#020202', '#010101', '#000000'],
  ['#0a0000', '#0d0000', '#0f0000', '#120000', '#150000', '#170000', '#1a0000', '#1c0000', '#1f0000', '#220000', '#240000', '#270000', '#2a0000', '#2c0000', '#2f0000', '#310000', '#340000', '#370000', '#390000', '#3c0000', '#3f0000', '#410000', '#440000', '#460000', '#490000', '#4c0000', '#4e0000', '#510000', '#540000', '#560000', '#590000', '#5b0000', '#5e0000', '#610000', '#630000', '#660000', '#690000', '#6b0000', '#6e0000', '#700000', '#730000', '#760000', '#780000', '#7b0000', '#7e0000', '#800000', '#830000', '#850000', '#880000', '#8b0000', '#8d0000', '#900000', '#930000', '#950000', '#980000', '#9a0000', '#9d0000', '#a00000', '#a20000', '#a50000', '#a80000', '#aa0000', '#ad0000', '#af0000', '#b20000', '#b50000', '#b70000', '#ba0000', '#bd0000', '#bf0000', '#c20000', '#c40000', '#c70000', '#ca0000', '#cc0000', '#cf0000', '#d20000', '#d40000', '#d70000', '#d90000', '#dc0000', '#df0000', '#e10000', '#e40000', '#e70000', '#e90000', '#ec0000', '#ee0000', '#f10000', '#f40000', '#f60000', '#f90000', '#fc0000', '#fe0000', '#ff0200', '#ff0500', '#ff0700', '#ff0a00', '#ff0c00', '#ff0f00', '#ff1200', '#ff1400', '#ff1700', '#ff1a00', '#ff1c00', '#ff1f00', '#ff2100', '#ff2400', '#ff2700', '#ff2900', '#ff2c00', '#ff2f00', '#ff3100', '#ff3400', '#ff3600', '#ff3900', '#ff3c00', '#ff3e00', '#ff4100', '#ff4400', '#ff4600', '#ff4900', '#ff4b00', '#ff4e00', '#ff5100', '#ff5300', '#ff5600', '#ff5900', '#ff5b00', '#ff5e00', '#ff6000', '#ff6300', '#ff6600', '#ff6800', '#ff6b00', '#ff6e00', '#ff7000', '#ff7300', '#ff7500', '#ff7800', '#ff7b00', '#ff7d00', '#ff8000', '#ff8300', '#ff8500', '#ff8800', '#ff8a00', '#ff8d00', '#ff9000', '#ff9200', '#ff9500', '#ff9700', '#ff9a00', '#ff9d00', '#ff9f00', '#ffa200', '#ffa500', '#ffa700', '#ffaa00', '#ffac00', '#ffaf00', '#ffb200', '#ffb400', '#ffb700', '#ffba00', '#ffbc00', '#ffbf00', '#ffc100', '#ffc400', '#ffc700', '#ffc900', '#ffcc00', '#ffcf00', '#ffd100', '#ffd400', '#ffd600', '#ffd900', '#ffdc00', '#ffde00', '#ffe100', '#ffe400', '#ffe600', '#ffe900', '#ffeb00', '#ffee00', '#fff100', '#fff300', '#fff600', '#fff900', '#fffb00', '#fffe00', '#ffff02', '#ffff06', '#ffff0a', '#ffff0e', '#ffff12', '#ffff16', '#ffff1a', '#ffff1e', '#ffff22', '#ffff26', '#ffff2a', '#ffff2e', '#ffff32', '#ffff36', '#ffff3a', '#ffff3e', '#ffff41', '#ffff45', '#ffff49', '#ffff4d', '#ffff51', '#ffff55', '#ffff59', '#ffff5d', '#ffff61', '#ffff65', '#ffff69', '#ffff6d', '#ffff71', '#ffff75', '#ffff79', '#ffff7d', '#ffff80', '#ffff84', '#ffff88', '#ffff8c', '#ffff90', '#ffff94', '#ffff98', '#ffff9c', '#ffffa0', '#ffffa4', '#ffffa8', '#ffffac', '#ffffb0', '#ffffb4', '#ffffb8', '#ffffbc', '#ffffbf', '#ffffc3', '#ffffc7', '#ffffcb', '#ffffcf', '#ffffd3', '#ffffd7', '#ffffdb', '#ffffdf', '#ffffe3', '#ffffe7', '#ffffeb', '#ffffef', '#fffff3', '#fffff7', '#fffffb', '#ffffff'],
  ['#000000', '#120102', '#240204', '#360306', '#490408', '#5b050a', '#6d060c', '#7f070e', '#920810', '#a40912', '#b60a14', '#c90b16', '#db0c18', '#ed0d1a', '#fe0e1c', '#f90f1e', '#f41020', '#ef1122', '#ea1224', '#e51326', '#e01428', '#db152a', '#d6162c', '#d1172e', '#cc1830', '#c71932', '#c21a34', '#bd1b36', '#b81c38', '#b41d3a', '#af1e3c', '#aa1f3e', '#a52040', '#a02041', '#9b2244', '#962346', '#912448', '#8c2449', '#87264c', '#82274e', '#7d2850', '#782851', '#732a54', '#6e2b56', '#692c58', '#642c59', '#5f2e5c', '#5a2f5e', '#553060', '#503061', '#4b3264', '#463366', '#413468', '#3c3469', '#37366c', '#32376e', '#2d3870', '#283871', '#233a74', '#1e3b76', '#193c78', '#143c79', '#0f3e7c', '#0a3f7e', '#404080', '#414182', '#414183', '#434386', '#444488', '#45458a', '#46468c', '#47478e', '#484890', '#494992', '#494993', '#4b4b96', '#4c4c98', '#4d4d9a', '#4e4e9c', '#4f4f9e', '#5050a0', '#5151a2', '#5151a3', '#5353a6', '#5454a8', '#5555aa', '#5656ac', '#5757ae', '#5858b0', '#5959b2', '#5959b3', '#5b5bb6', '#5c5cb8', '#5d5dba', '#5e5ebc', '#5f5fbe', '#6060c0', '#6161c2', '#6161c3', '#6363c6', '#6464c8', '#6565ca', '#6666cc', '#6767ce', '#6868d0', '#6969d2', '#6969d3', '#6b6bd6', '#6c6cd8', '#6d6dda', '#6e6edc', '#6f6fde', '#7070e0', '#7171e2', '#7171e3', '#7373e6', '#7474e8', '#7575ea', '#7676ec', '#7777ee', '#7878f0', '#7979f2', '#7979f3', '#7b7bf6', '#7c7cf8', '#7d7dfa', '#7e7efc', '#7f7ffe', '#8080fc', '#8181f8', '#8282f4', '#8383f0', '#8383eb', '#8485e7', '#8686e3', '#8787df', '#8888da', '#8989d6', '#8a8ad2', '#8b8bce', '#8c8cc9', '#8d8dc5', '#8e8ec1', '#8f8fbd', '#9090b8', '#9191b4', '#9292b0', '#9393ac', '#9393a7', '#9595a3', '#96969f', '#97979a', '#989896', '#999992', '#9a9a8e', '#9b9b89', '#9c9c85', '#9d9d81', '#9e9e7d', '#9f9f78', '#a0a074', '#a1a170', '#a2a26c', '#a3a367', '#a3a363', '#a5a55f', '#a6a65b', '#a7a756', '#a8a852', '#a9a94e', '#aaaa4a', '#abab45', '#acac41', '#adad3d', '#aeae39', '#afaf34', '#b0b030', '#b1b12c', '#b2b228', '#b3b323', '#b3b31f', '#b5b51b', '#b6b617', '#b7b712', '#b8b80e', '#b9b90a', '#baba06', '#bbbb01', '#bcbc02', '#bdbd05', '#bebe09', '#bfbf0d', '#c0c011', '#c1c115', '#c2c218', '#c3c31c', '#c3c320', '#c4c524', '#c5c627', '#c7c72b', '#c8c82f', '#c9c933', '#caca37', '#cbcb3a', '#cbcc3e', '#cdcd42', '#cece46', '#cfcf49', '#d0d04d', '#d1d151', '#d2d255', '#d3d358', '#d3d35c', '#d5d560', '#d6d664', '#d7d768', '#d8d86b', '#d9d96f', '#dada73', '#dbdb77', '#dcdc7a', '#dddd7e', '#dede82', '#dfdf86', '#e0e08a', '#e1e18d', '#e2e291', '#e3e395', '#e3e399', '#e5e59c', '#e6e6a0', '#e7e7a4', '#e8e8a8', '#e9e9ab', '#eaeaaf', '#ebebb3', '#ececb7', '#ededbb', '#eeeebe', '#efefc2', '#f0f0c6', '#f1f1ca', '#f2f2cd', '#f3f3d1', '#f3f3d5', '#f4f5d9', '#f5f6dd', '#f7f7e0', '#f8f8e4', '#f9f9e8', '#fafaec', '#fbfbef', '#fbfcf3', '#fdfdf7', '#fefefb', '#ffffff'],
  ['#000080', '#000776', '#000e6d', '#001563', '#001d5a', '#002450', '#002b47', '#00333e', '#003a34', '#00412b', '#004821', '#005018', '#00570f', '#005e05', '#005816', '#005126', '#004a37', '#004348', '#003d58', '#003669', '#002f79', '#00288a', '#00219b', '#001bab', '#0014bc', '#000dcd', '#0006dd', '#0000ee', '#000eff', '#001cff', '#002aff', '#0038ff', '#0046ff', '#0054ff', '#0062ff', '#0070ff', '#007fff', '#008dff', '#009bff', '#00a9ff', '#00b7ff', '#00c0ff', '#00c5ff', '#00caff', '#00ceff', '#00d2ff', '#00d7ff', '#00dbff', '#00e0ff', '#00e4ff', '#00e8ff', '#00edff', '#00f1fe', '#00f6f8', '#00faf1', '#00feeb', '#00fee4', '#00fede', '#00fdd7', '#00fdd1', '#00fcca', '#00fcc3', '#00fbbd', '#00fbb6', '#00fab0', '#00faa9', '#00faa3', '#00fa9c', '#00fa92', '#00fa87', '#00fa7d', '#00fa72', '#00fb68', '#00fb5d', '#00fc53', '#00fc49', '#00fc3e', '#00fd34', '#00fd29', '#00fe1f', '#06fe14', '#0cfe0a', '#13fb00', '#19f700', '#1ff300', '#26ef00', '#2cec00', '#32e800', '#39e400', '#3fe000', '#46dd00', '#4cd900', '#52d500', '#59d100', '#5fce00', '#65d100', '#67d400', '#69d700', '#6bdb00', '#6dde00', '#6fe100', '#71e400', '#73e800', '#75eb00', '#77ee00', '#79f100', '#7bf500', '#7df803', '#7ffb07', '#84fe0b', '#88ff0f', '#8dff13', '#91ff17', '#96ff1b', '#9aff1f', '#9fff23', '#a4ff27', '#a8ff2b', '#adff2f', '#b1ff33', '#b6ff37', '#baff3b', '#bfff37', '#c3ff33', '#c8ff2f', '#ccff2b', '#d1ff27', '#d6ff23', '#daff1f', '#dfff1b', '#e3ff17', '#e8ff13', '#ecff0f', '#f1ff0b', '#f5fc07', '#fafa03', '#fff700', '#fff500', '#fff200', '#fff000', '#ffed00', '#ffeb00', '#ffe800', '#ffe600', '#ffe300', '#ffe100', '#ffde00', '#ffdc00', '#ffda00', '#ffd701', '#ffd502', '#ffd203', '#ffd004', '#ffcd05', '#ffcb06', '#ffc807', '#ffc608', '#ffc309', '#ffc10a', '#ffbe0b', '#ffbc0c', '#ffb90d', '#ffb10d', '#ffa90c', '#ffa10b', '#ff990a', '#ff9109', '#ff8808', '#ff8007', '#ff7806', '#ff7005', '#ff6804', '#ff5f03', '#ff5702', '#ff4f01', '#ff4700', '#ff4200', '#ff3d00', '#ff3900', '#ff3400', '#ff2f00', '#ff2a00', '#ff2600', '#ff2100', '#ff1c00', '#ff1700', '#ff1300', '#ff0e00', '#ff0900', '#ff0411', '#ff0023', '#ff0035', '#ff0046', '#ff0058', '#ff006a', '#ff007b', '#ff008d', '#ff009f', '#ff00b1', '#ff00c2', '#ff00d4', '#ff00e6', '#ff00f8', '#f803fb', '#f106ff', '#ea0aff', '#e30dff', '#dc11ff', '#d514ff', '#ce18ff', '#c71bff', '#c11eff', '#ba22ff', '#b325ff', '#ac29ff', '#a52cfe', '#9e32fd', '#a438fc', '#aa3efb', '#b044fa', '#b64af8', '#bc50f7', '#c256f6', '#c75cf5', '#cd61f4', '#d367f2', '#d96df1', '#df73f0', '#e579ef', '#eb7fee', '#ec84ee', '#ec88ef', '#ed8df0', '#ee92f0', '#ef96f1', '#ef9bf1', '#f09ff2', '#f1a4f3', '#f1a9f3', '#f2adf4', '#f3b2f4', '#f4b7f5', '#f4bbf6', '#f5c0f6', '#f6c5f7', '#f6c9f7', '#f7cef8', '#f8d2f9', '#f9d7f9', '#f9dcfa', '#fae0fa', '#fbe5fb', '#fbeafc', '#fceefc', '#fdf3fd', '#fef7fe']
]

const updateOptions = (): void => {
  emits('emitOptions', {
    palette: selectedPalette.value,
    max: currentMaxValue.value,
    normalized: isNormalize.value,
    amplitude: amplitudeThreshold.value,
    amplitudeReference: selectedAmplitudeReference.value
  })
  emits('cancel')
}

const onSelectNormalize = () => {
  isNormalize.value = !isNormalize.value
}

const selectPalette = (idx: number) => {
  selectedPalette.value = idx
}

const initialData = () => {
  currentMaxValue.value = props.soundscape.visual_max_value ?? 1
  isNormalize.value = props.soundscape.normalized === 1
  amplitudeThreshold.value = props.soundscape.threshold
  selectedAmplitudeReference.value = props.soundscape.threshold_type
  selectedPalette.value = props.soundscape.visual_palette
}

const openDropdown = async () => {
  await nextTick()
  initDropdowns()
}

watch(() => props.soundscape, async () => {
  await nextTick()
  initialData()
  initTooltips()
  initDropdowns()
})

onMounted(async () => {
  await nextTick()
  initTooltips()
  initDropdowns()
  initialData()
})

</script>
