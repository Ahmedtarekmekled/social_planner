"use client"

import { Suspense } from 'react'
import { Sidebar } from "@/components/layout/sidebar"
import { PostProvider } from "@/components/providers/post-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Calendar, Trash2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function DraftsPage({ searchParams }: Props) {
  const locationId = searchParams.location_id as string | undefined
  const sessionKey = searchParams.session as string | undefined

  // Mock draft posts - will be replaced with real data from Supabase
  const drafts = [
    {
      id: "1",
      text: "Check out our new product launch! 🚀 #innovation #tech",
      platforms: ["instagram", "facebook"],
      createdAt: new Date("2026-01-18T10:30:00"),
      mediaCount: 2
    },
    {
      id: "2",
      text: "Behind the scenes of our latest photoshoot 📸",
      platforms: ["instagram"],
      createdAt: new Date("2026-01-17T15:20:00"),
      mediaCount: 5
    },
    {
      id: "3",
      text: "Exciting announcement coming soon! Stay tuned 👀",
      platforms: ["twitter", "facebook", "telegram"],
      createdAt: new Date("2026-01-16T09:15:00"),
      mediaCount: 0
    }
  ]

  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <PostProvider initialLocationId={locationId} initialSession={sessionKey}>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col">
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your saved draft posts
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {drafts.length} {drafts.length === 1 ? 'Draft' : 'Drafts'}
                </Badge>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {drafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No drafts yet</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start creating posts and save them as drafts
                    </p>
                  </div>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <p className="text-sm leading-relaxed">{draft.text}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {draft.createdAt.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            
                            {draft.mediaCount > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{draft.mediaCount} media</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <span>{draft.platforms.length} platforms</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </main>
        </div>
      </PostProvider>
    </Suspense>
  )
}
