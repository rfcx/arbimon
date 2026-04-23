<template>
  <div class="flex min-h-screen bg-black text-white">
    <div class="w-64 bg-[#0a0a0a] border-r border-gray-800 font-display">
      <div class="p-5" />
      <nav>
        <button
          :class="[activeTab === 'projects' ? 'bg-white text-black font-bold' : 'text-gray-400']"
          class="w-full flex items-center px-8 py-4 text-xl transition-all"
          @click="$emit('update:tab', 'projects')"
        >
          <Squares2X2Icon class="w-7 h-7 mr-4" /> Projects
        </button>
        <button
          :class="[activeTab === 'users' ? 'bg-white text-black font-bold' : 'text-gray-400']"
          class="w-full flex items-center px-8 py-4 text-xl transition-all"
          @click="$emit('update:tab', 'users')"
        >
          <UsersIcon class="w-7 h-7 mr-4" /> Users
        </button>
      </nav>
    </div>

    <div class="flex-1 p-8 overflow-auto">
      <div class="flex gap-4 mb-6">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="w-5 h-5 absolute left-4 top-3 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            style="background-color: white !important; box-shadow: none !important;"
            class="h-11 w-full text-black pl-12 pr-4  rounded-xl outline-none border border-transparent focus:border-gray-200 transition-all"
          >
        </div>

        <div
          ref="planRef"
          class="relative"
        >
          <button
            class="bg-white text-black px-6 py-3 rounded-xl min-w-[150px] flex items-center justify-between border border-gray-100 hover:bg-gray-50 transition-all"
            @click="isPlanOpen = !isPlanOpen"
          >
            <span class="text-sm font-medium">{{ selectedPlan }}</span>
            <ChevronDownIcon
              class="w-4 h-4 ml-2 text-gray-400 transition-transform"
              :class="{ 'rotate-180': isPlanOpen }"
            />
          </button>

          <div
            v-if="isPlanOpen"
            class="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2"
          >
            <button
              v-for="plan in plans"
              :key="plan"
              class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#c1ff72] hover:text-black flex items-center transition-colors"
              :class="{ 'bg-gray-50 font-bold': selectedPlan === plan }"
              @click="selectPlan(plan)"
            >
              {{ plan }}
            </button>
          </div>
        </div>

        <div
          ref="privacyRef"
          class="relative"
        >
          <button
            class="bg-white text-black px-6 py-3 rounded-xl min-w-[150px] flex items-center justify-between border border-gray-100 hover:bg-gray-50 transition-all"
            @click="isPrivacyOpen = !isPrivacyOpen"
          >
            <span class="text-sm font-medium">{{ selectedPrivacy }}</span>
            <ChevronDownIcon
              class="w-4 h-4 ml-2 text-gray-400 transition-transform"
              :class="{ 'rotate-180': isPrivacyOpen }"
            />
          </button>

          <div
            v-if="isPrivacyOpen"
            class="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2"
          >
            <button
              v-for="p in privacies"
              :key="p"
              class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#c1ff72] hover:text-black flex items-center transition-colors"
              :class="{ 'bg-gray-50 font-bold': selectedPrivacy === p }"
              @click="selectPrivacy(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-8 min-h-[600px] flex flex-col shadow-xl text-[#4e5d78]">
        <h2 class="text-xl font-bold mb-6 text-[#1e293b]">
          <slot name="title" />
        </h2>

        <div class="flex-1 overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[#8a94a6] border-b border-gray-100 text-sm">
                <slot name="thead" />
              </tr>
            </thead>
            <tbody>
              <slot name="tbody" />
              <tr
                v-for="i in 10"
                :key="i"
                class="border-b border-gray-50 h-[48px]"
              >
                <td :colspan="10" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mt-6 gap-1">
          <button
            v-for="p in 4"
            :key="p"
            :class="[p === 1 ? 'bg-[#c1ff72]' : 'bg-gray-200 text-gray-500']"
            class="w-6 h-6 rounded text-[10px] font-bold"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue'

const Squares2X2Icon = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', strokeWidth: '1.5', stroke: 'currentColor', class: 'w-7 h-7' }, [
    h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' })
  ])
})

const UsersIcon = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', strokeWidth: '1.5', stroke: 'currentColor', class: 'w-7 h-7' }, [
    h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' })
  ])
})

const MagnifyingGlassIcon = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', strokeWidth: '2', stroke: 'currentColor', class: 'w-5 h-5' }, [
    h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' })
  ])
})

const isPlanOpen = ref(false)
const selectedPlan = ref('All Plan')
const plans = ['All Plan', 'Inactive', 'Free', 'Pro', 'Ent']

const isPrivacyOpen = ref(false)
const selectedPrivacy = ref('All Privacy')
const privacies = ['All Privacy', 'Public', 'Private']

const planRef = ref<HTMLElement | null>(null)
const privacyRef = ref<HTMLElement | null>(null)

const closeAll = (e: MouseEvent) => {
  if (planRef.value && !planRef.value.contains(e.target as Node)) isPlanOpen.value = false
  if (privacyRef.value && !privacyRef.value.contains(e.target as Node)) isPrivacyOpen.value = false
}

onMounted(() => window.addEventListener('click', closeAll))
onUnmounted(() => window.removeEventListener('click', closeAll))

const ChevronDownIcon = (props: any) => (
  h('svg', { ...props, fill: 'none', viewBox: '0 0 24 24', strokeWidth: '2', stroke: 'currentColor' }, [
    h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M19.5 8.25l-7.5 7.5-7.5-7.5' })
  ])
)

defineProps<{ activeTab: string }>()
const emit = defineEmits([
  'update:tab',
  'update:plan',
  'update:privacy',
  'update:search'
])

const searchQuery = ref('')

watch(searchQuery, (newVal) => {
  emit('update:search', newVal)
})

const selectPlan = (plan: string) => {
  selectedPlan.value = plan
  isPlanOpen.value = false
  emit('update:plan', plan)
}

const selectPrivacy = (privacy: string) => {
  selectedPrivacy.value = privacy
  isPrivacyOpen.value = false
  emit('update:privacy', privacy)
}

</script>
