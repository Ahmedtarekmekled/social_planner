export type Platform = 'instagram' | 'facebook' | 'x' | 'telegram'

export interface Post {
  id: string
  customer_id: string
  base_caption: string
  platform_overrides: Record<Platform, string>
  platforms: Platform[]
  media_urls: string[]
  scheduled_at: string | null
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  publer_post_id?: string
  error_message?: string
  created_at: string
}

export interface Customer {
  id: string
  ghl_location_id: string
  name: string
  timezone: string
}

export interface UploadedMedia {
  url: string
  type: 'image' | 'video'
  name: string
}
