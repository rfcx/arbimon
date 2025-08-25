<template>
  <div
    v-if="isArbiToggled"
    id="arbi-chat"
    class="inset-y-auto right-0 fixed w-[450px] overflow-y-auto transition-transform -translate-x-full bg-pitch absolute z-40 h-100vh border-0 shadow"
    aria-labelledby="arbi-chat-label"
    tabindex="-1"
  >
    <div class="h-full overflow-y">
      <div class="relative sticky top-0">
        <div class="flex flex-row justify-between items-center border-b border-util-gray-03 py-4">
          <div class="pl-4 text-lg relative">
            <icon-custom-fi-arbi-assistant-icon class="absolute top-[-5px] left-12" />
            Arbi Assistant
          </div>
          <div class="flex flex-row justify-end items-center gap-x-2 pr-4">
            <button
              type="button"
              title="Clear the chat"
              @click="clearChat"
            >
              <icon-custom-fi-arbi-assistant-edit class="h-5 cursor-pointer text-frequency" />
            </button>
            <button
              type="button"
              title="Close Arbi Assistant"
              @click="toggleArbi"
            >
              <icon-custom-fi-close-thin class="h-5 w-5 cursor-pointer text-frequency" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex h-[calc(100vh-60px)] justify-between flex-col overflow-y-auto">
        <div>
          <div
            v-if="!messages.length"
            class="flex flex-col px-6 py-4 gap-y-4 pt-20"
          >
            <div class="flex flex-col items-center flex-wrap gap-2">
              <p class="text-lg">
                Hello! I'm Arbi.
              </p>
              <span class="text-sm">I’m here to help you explore the Arbimon project directory. You can ask about:</span>
            </div>
            <ul class="flex flex-col justify-start list-disc list-inside p-4 gap-2 text-sm">
              <li>locations by country, region</li>
              <li>species by name, taxon or IUCN status</li>
              <li>types of project</li>
              <li>recordings</li>
            </ul>
            <div class="flex flex-col justify-start text-sm">
              <p>You can ask me...</p>
              <div class="flex flex-col justify-start flex-wrap py-4 gap-y-3">
                <div
                  v-for="(tag, index) in tagsTitles"
                  :key="index"
                  class="w-fit p-2 text-sm text-wrap bg-transparent rounded-[10px] border-1 border-frequency text-frequency cursor-pointer"
                  @click="selectQuestion(tag.text)"
                >
                  {{ tag.text }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="messages.length"
            ref="chatContainer"
            class="flex flex-1 flex-col gap-4 px-4 pt-4 overflow-y-auto"
          >
            <ChatBubble
              v-for="(msg, index) in messages"
              :key="index"
              :text="msg.text"
              :is-user="msg.isUser"
            />
            <div v-if="isTyping">
              <ChatBubble
                :text="'Typing...'"
                :is-user="false"
              />
            </div>
          </div>
        </div>
        <div class="[h-96px] w-full px-4 py-6">
          <form
            class="flex p-3 bg-pitch relative items-center overflow-hidden rounded-lg border border-util-gray-02"
            @submit.prevent="sendMessage"
          >
            <textarea
              v-model="newMessage"
              type="text"
              placeholder="How can I help?"
              class="placeholder:(text-util-gray-01 text-sm font-semibold) flex flex-wrap overflow-y-auto [h-96px] px-2 pb-10 w-full bg-pitch border-0 scroll-smooth outline-none focus:(outline-none ring-transparent)"
            />
            <button
              type="submit"
              class="absolute bottom-2 right-2"
            >
              <icon-custom-fi-arbi-assistant-send class="h-7 w-7 cursor-pointer" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <button
      type="button"
      title="Open Arbi Assistant"
      class="fixed z-50 bottom-13 right-15 bg-transparent rounded-full p-0"
      @click="toggleArbi"
    >
      <icon-custom-fi-arbi-assistant class="h-25 w-25 cursor-pointer text-insight" />
    </button>
  </div>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject, nextTick, ref } from 'vue'

import type { ArbiResponseData, ArbiSessionData, ArbiUserQuestionParams } from '@rfcx-bio/common/api-arbimon/arbi-assistant'

import { apiClientKey } from '@/globals'
import { usePostUserQuestion } from './_composables/use-post-user-question'
import { usePostUserSession } from './_composables/use-post-user-session'
import ChatBubble from './chat-bubble.vue'

const tagsTitles = [
  { text: 'Which countries have the most projects?' },
  { text: 'How many projects are there in Brazil?' },
  { text: 'Which projects have most endangered species?' },
  { text: 'Find reforestation projects in Taiwan' },
  { text: 'Find projects near me' }
]

interface Messages {
  text: string
  isUser: boolean
}

const messages = ref<Messages[]>([])

const isArbiToggled = ref<boolean>(false)
const newMessage = ref('')
const currentSessionId = ref('')
const isTyping = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const apiClient = inject(apiClientKey) as AxiosInstance
const { mutate: mutateSession } = usePostUserSession(apiClient)
const { mutate: mutateQuestion } = usePostUserQuestion(apiClient)

const toggleArbi = () => {
  isArbiToggled.value = !isArbiToggled.value
  if (!messages.value.length) {
    getSession()
  }
}

const getSession = () => {
  mutateSession('anonymous_user', {
    onSuccess: async (arbiSessionData: ArbiSessionData) => {
      currentSessionId.value = arbiSessionData.id
    }
  })
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  const parsedMessage = newMessage.value.trim()
  messages.value.push({ text: parsedMessage, isUser: true })
  newMessage.value = ''
  scrollToBottom()
  isTyping.value = true
  const payload = {
    appName: 'arbimon_assistant',
    userId: 'anonymous_user',
    sessionId: currentSessionId.value,
    newMessage: {
      parts: [{
        text: parsedMessage
      }],
      role: 'user'
    },
    streaming: false
  } as ArbiUserQuestionParams
  mutateQuestion(payload, {
    onSuccess: async (arbiAnswer: ArbiResponseData[]) => {
      const firstAnswer = arbiAnswer[arbiAnswer.length - 1]
      const result = firstAnswer.content.parts[0].text
      if (result !== undefined) {
        messages.value.push({ text: result, isUser: false })
      }
      isTyping.value = false
    },
    onError: () => {
      const result = 'Connection is busy ( Please try again later! Im a bot, but I try my best!'
      messages.value.push({ text: result, isUser: false })
      isTyping.value = false
    }
  })
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const selectQuestion = (text: string) => {
  newMessage.value = text
  sendMessage()
}

const clearChat = () => {
  newMessage.value = ''
  messages.value = []
  isTyping.value = false
}

</script>
