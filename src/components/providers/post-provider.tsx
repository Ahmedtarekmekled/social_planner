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
            setSelectedAccountIds(data.map((a: PublerAccount) => a.id))
          }
        } else {
            const err = await res.json()
            console.error("API Error:", err)
            // toast.error(`Failed to load accounts: ${err.error || 'Unknown error'}`)
        }
      } catch (e) {
        console.error("Failed to fetch accounts", e)
      } finally {
        setIsLoadingAccounts(false)
      }
    }
    fetchAccounts()
  }, [])

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
