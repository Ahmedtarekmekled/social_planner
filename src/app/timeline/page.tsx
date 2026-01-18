"use client"

import { Suspense } from 'react'
import Link from 'next/link'
import { Sidebar } from "@/components/layout/sidebar"
import { PostProvider } from "@/components/providers/post-provider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, CheckCircle2, Instagram, Facebook, Twitter, Send, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function TimelinePage({ searchParams }: Props) {
  const locationId = searchParams.location_id as string | undefined
  const sessionKey = searchParams.session as string | undefined

  // TODO: Fetch real posts from Supabase
  const scheduledPosts: any[] = []
  const publishedPosts: any[] = []

  const getPlatformIcon = (platform: string) => {
    const iconClass = "h-4 w-4"
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className={`${iconClass} text-pink-500`} />
      case 'facebook':
        return <Facebook className={`${iconClass} text-blue-600`} />
      case 'twitter':
        return <Twitter className={`${iconClass} text-sky-500`} />
      case 'telegram':
        return <Send className={`${iconClass} text-blue-400`} />
      default:
        return null
    }
  }

  const PostCard = ({ post, isScheduled }: { post: any; isScheduled: boolean }) => (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="space-y-3">
        <p className="text-sm leading-relaxed">{post.text}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {isScheduled ? (
              <>
                <Clock className="h-3 w-3" />
                <span>
                  {post.scheduledFor.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {post.publishedAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </>
            )}
          </div>
          
          {post.mediaCount > 0 && (
            <span>{post.mediaCount} media</span>
          )}
          
          <div className="flex items-center gap-1">
            {post.platforms.map((platform: string) => (
              <div key={platform}>{getPlatformIcon(platform)}</div>
            ))}
          </div>
        </div>

        {!isScheduled && post.engagement && (
          <div className="flex items-center gap-4 text-xs pt-2 border-t">
            <span>❤️ {post.engagement.likes}</span>
            <span>💬 {post.engagement.comments}</span>
            <span>🔄 {post.engagement.shares}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <PostProvider initialLocationId={locationId} initialSession={sessionKey}>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col">
            <div className="border-b p-6">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    View your scheduled and published posts
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="scheduled" className="flex-1 flex flex-col">
              <div className="border-b px-6">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="scheduled" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Scheduled ({scheduledPosts.length})
                  </TabsTrigger>
                  <TabsTrigger value="published" className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Published ({publishedPosts.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="scheduled" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-4">
                    {scheduledPosts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No scheduled posts</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Schedule posts to see them here
                        </p>
                      </div>
                    ) : (
                      scheduledPosts.map((post) => (
                        <PostCard key={post.id} post={post} isScheduled={true} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="published" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-4">
                    {publishedPosts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CheckCircle2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No published posts</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your published posts will appear here
                        </p>
                      </div>
                    ) : (
                      publishedPosts.map((post) => (
                        <PostCard key={post.id} post={post} isScheduled={false} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </PostProvider>
    </Suspense>
  )
}
