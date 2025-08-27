import { useConfigStore } from '@/stores/configstore'
import { vopidyhttp } from '@/services/vopidyhttp'

const randomInt = (max: number = 65535) => {
  const min = Math.ceil(1)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const vopidy = async (method: string, params: any) => {
  const config = useConfigStore()
  const mode = (config.config.communicationMode ?? 'http').toLowerCase()
  return await vopidyhttp(method, params)
}
