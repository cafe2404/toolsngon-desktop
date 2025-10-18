import axios from 'axios'

export type BlockedUrl = {
  id: number
  keyword: string
  created_at: string
  updated_at: string
}

class BlockedUrlsManager {
  public blockedKeywords: string[] = []
  private lastFetch: number = 0
  private readonly FETCH_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly BASE_URL = process.env.VITE_SERVER_URL || 'http://127.0.0.1:8000'

  async fetchBlockedUrls(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/blocked-urls/`)
      const blockedUrls: BlockedUrl[] = response.data
      this.blockedKeywords = blockedUrls.map(item => item.keyword)
      this.lastFetch = Date.now()
      console.log('✅ Loaded blocked keywords:', this.blockedKeywords)
      return this.blockedKeywords
    } catch (error) {
      console.error('❌ Failed to fetch blocked URLs:', error)
      return this.blockedKeywords // Return cached keywords if fetch fails
    }
  }

  async getBlockedKeywords(): Promise<string[]> {
    const now = Date.now()
    if (now - this.lastFetch > this.FETCH_INTERVAL || this.blockedKeywords.length === 0) {
      await this.fetchBlockedUrls()
    }
    return this.blockedKeywords
  }

  isUrlBlocked(url: string): boolean {
    if (!url || this.blockedKeywords.length === 0) return false
    
    const urlLower = url.toLowerCase()
    return this.blockedKeywords.some(keyword => 
      urlLower.includes(keyword.toLowerCase())
    )
  }

  getBlockedKeyword(url: string): string | null {
    if (!url || this.blockedKeywords.length === 0) return null
    
    const urlLower = url.toLowerCase()
    return this.blockedKeywords.find(keyword => 
      urlLower.includes(keyword.toLowerCase())
    ) || null
  }
}

export const blockedUrlsManager = new BlockedUrlsManager()
