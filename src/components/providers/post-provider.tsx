"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Platform, UploadedMedia } from '@/types'
import type { PublerAccount } from '@/lib/publer'

interface PostState {
  caption: string
  setCaption: (caption: string) => void
  platformOverrides: Record<string, string>
  setPlatformOverride: (platform: Platform, caption: string) => void
  media: UploadedMedia[]
  addMedia: (media: UploadedMedia) => void
  updateMedia: (index: number, updates: Partial<UploadedMedia>) => void
  removeMedia: (index: number) => void
  selectedPlatforms: Platform[]
  togglePlatform: (platform: Platform) => void
  activePlatform: Platform | 'all'
  setActivePlatform: (platform: Platform | 'all') => void
  getEffectiveCaption: (platform: Platform) => string

  // Account Management
  accounts: PublerAccount[]
  selectedAccountIds: string[]
  toggleAccount: (id: string) => void
  isLoadingAccounts: boolean

  // GHL Context
  ghlContext: { locationId?: string, session?: string }
}

const PostContext = createContext<PostState | undefined>(undefined)

export function PostProvider({
  children,
  initialLocationId,
  initialSession
}: {
  children: ReactNode;
  initialLocationId?: string;
  initialSession?: string;
}) {
  const searchParams = useSearchParams()
  const locationId = searchParams.get('location_id') || initialLocationId
  const session = searchParams.get('session') || initialSession
  const [caption, setCaption] = useState("")
  const [platformOverrides, setPlatformOverrides] = useState<Record<string, string>>({})
  const [media, setMedia] = useState<UploadedMedia[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram', 'facebook', 'x', 'telegram'])
  const [activePlatform, setActivePlatform] = useState<Platform | 'all'>('all')
  const [ghlContext] = useState({ locationId, session })

  // Account State
  const [accounts, setAccounts] = useState<PublerAccount[]>([])
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('/api/publer/accounts')
        if (res.ok) {
          const data = await res.json()
          setAccounts(data)
          if (Array.isArray(data)) {
            // Only set if not loading a draft? Or always?
            // If loading a draft, we should probably set account IDs from the draft later.
            // For now, let's just load accounts.
            // setSelectedAccountIds(data.map((a: PublerAccount) => a.id)) 
          }
        }
      } catch (e) {
        console.error("Failed to fetch accounts", e)
      } finally {
        setIsLoadingAccounts(false)
      }
    }
    fetchAccounts()
  }, [])

  // Load Draft Effect
  useEffect(() => {
    const draftId = searchParams.get('draft_id');
    if (!draftId) {
      // Default selection if NO draft is loaded
      if (accounts.length > 0 && selectedAccountIds.length === 0) {
        setSelectedAccountIds(accounts.map(a => a.id))
      }
      return;
    }

    const loadDraft = async () => {
      try {
        // Assuming we can fetch a single post via the same list API or a new one.
        // The list API supports filters, so we can probably filter by ID if we added it, 
        // OR just fetch all (inefficient) OR add a single fetch endpoint.
        // Let's assume we need to filtering by ID in GET /api/posts is not explicitly implemented yet 
        // but `supabase.from('posts').select('*')` is easy.
        // Actually, GET /api/posts takes status/location_id. 
        // We'll trust the user to add "id" support to GET or we will implement it now.
        // Wait, I only implemented DELETE support for ID.
        // I should probably update GET to support ID too. 
        // But let's check if I can just fetch it here directly via the same API endpoint if I modify it.

        const res = await fetch(`/api/posts?id=${draftId}`);
        // Wait, the GET endpoint handles status/location filters. 
        // I need to ensure GET /api/posts supports 'id' param retrieval.
        const data = await res.json();

        if (data.posts && data.posts.length > 0) {
          const draft = data.posts[0];
          setCaption(draft.base_caption || "");
          // Media handling: draft.media_urls is string[]
          // We need to map back to UploadedMedia[]
          if (draft.media_urls && Array.isArray(draft.media_urls)) {
            setMedia(draft.media_urls.map((url: string) => ({
              url,
              type: (url.endsWith('.mp4') || url.includes('video')) ? 'video' : 'image', // Basic type inference
              name: 'Draft Media'
            })));
          }

          // Account handling
          // draft.platforms might store account IDs or platform names depending on implementation.
          // In route.ts POST: `platforms: accounts || []` where accounts are IDs.
          // So we can set selected account keys.
          // But wait, are they IDs? 
          // Yes, in `post-editor.tsx`, `accounts: selectedAccountIds` is sent.
          // So draft.platforms should be an array of IDs.
          if (draft.platforms && Array.isArray(draft.platforms)) {
            setSelectedAccountIds(draft.platforms);
          }
        }
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
    loadDraft();
  }, [searchParams, accounts.length]) // check accounts.length to ensure we don't overwrite draft selection with default 

  const setPlatformOverride = (platform: Platform, text: string) => {
    setPlatformOverrides(prev => ({ ...prev, [platform]: text }))
  }

  const addMedia = (item: UploadedMedia) => {
    setMedia(prev => [...prev, item])
  }

  const updateMedia = (index: number, updates: Partial<UploadedMedia>) => {
    setMedia(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item))
  }

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index))
  }

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleAccount = (id: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const getEffectiveCaption = (platform: Platform) => {
    return platformOverrides[platform] || caption
  }

  return (
    <PostContext.Provider value={{
      caption, setCaption,
      platformOverrides, setPlatformOverride,
      media, addMedia, updateMedia, removeMedia,
      selectedPlatforms, togglePlatform,
      activePlatform, setActivePlatform,
      getEffectiveCaption,
      accounts, selectedAccountIds, toggleAccount, isLoadingAccounts,
      ghlContext
    }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePost() {
  const context = useContext(PostContext)
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider')
  }
  return context
}
