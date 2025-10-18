/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { api } from './axios'

export type BlockedUrl = {
  id: number
  keyword: string
  created_at: string
  updated_at: string
}

export const blockedUrlsApi = {
  // Lấy danh sách blocked URLs
  getBlockedUrls: async (): Promise<BlockedUrl[]> => {
    try {
      const response = await api.get('/api/blocked-urls/')
      return response.data
    } catch (error) {
      console.error('Failed to fetch blocked URLs:', error)
      return []
    }
  },

  // Kiểm tra URL có bị block không
  isUrlBlocked: (url: string, blockedKeywords: string[]): boolean => {
    if (!url || !blockedKeywords.length) return false
    
    const urlLower = url.toLowerCase()
    return blockedKeywords.some(keyword => 
      urlLower.includes(keyword.toLowerCase())
    )
  },

  // Lấy danh sách keywords từ blocked URLs
  getKeywords: (blockedUrls: BlockedUrl[]): string[] => {
    return blockedUrls.map(item => item.keyword)
  }
}

export default blockedUrlsApi
