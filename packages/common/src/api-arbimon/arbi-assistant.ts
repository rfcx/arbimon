import { type AxiosInstance } from 'axios'

// Request types
export interface ArbiUserSessionParams {
  userId: string
}

interface Message {
  parts: Parts[]
  role: string
}

interface Parts {
  text: string
}

export interface ArbiUserQuestionParams {
  appName: string
  userId: string
  sessionId: string
  newMessage: Message
  streaming: boolean
}

// Response types
export interface ArbiSessionData {
  id: string
  appName: string
  userId: string
  state: { any: any }
  events: []
  lastUpdateTime: number
}

interface ArbiResponseContentData {
  parts: ArbiResponseParts[]
  role: string
}

interface ArbiResponseParts {
  thoughtSignature: string
  text: string
}

export interface ArbiResponseData {
  content: ArbiResponseContentData
  usageMetadata: any
  invocationId: string
  author: string
  actions: any
  id: string
  timestamp: number
}

// Route
export const arbiAssistantSessionRoute = '/arbi-assistant/sessions'
export const arbiAssistantQuestionRoute = '/arbi-assistant/run'

// Service
export const apiGetArbiSession = async (apiClient: AxiosInstance, userId: string): Promise<ArbiSessionData> => {
  return await apiClient.post(arbiAssistantSessionRoute, { userId }).then(res => res.data)
}

export const apiPostUserQuestion = async (apiClient: AxiosInstance, payload: ArbiUserQuestionParams): Promise<ArbiResponseData[]> => {
  return await apiClient.post(`${arbiAssistantQuestionRoute}`, payload).then(res => res.data)
}
