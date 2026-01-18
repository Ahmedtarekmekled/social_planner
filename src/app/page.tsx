
import { Suspense } from 'react'
import { Sidebar } from "@/components/layout/sidebar"
import { PostEditor } from "@/components/layout/post-editor"
import { PreviewPane } from "@/components/layout/preview-pane"
import { PostProvider } from "@/components/providers/post-provider"

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Home({ searchParams }: Props) {
  // Capture GHL context from URL (Server Side)
  // We still pass this as fallback, but PostProvider also checks client side
  const locationId = searchParams.location_id as string | undefined
  const sessionKey = searchParams.session as string | undefined

  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        <PostProvider initialLocationId={locationId} initialSession={sessionKey}>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex min-w-0 shadow-2xl z-10">
            <PostEditor />
            <PreviewPane />
            </main>
        </div>
        </PostProvider>
    </Suspense>
  )
}

