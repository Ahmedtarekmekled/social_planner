"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react"

interface TestResult {
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
  error?: string
  hint?: string
}

export default function TestPage() {
  const [supabaseResult, setSupabaseResult] = useState<TestResult>({ status: 'pending', message: 'Not tested yet' })
  const [ghlResult, setGhlResult] = useState<TestResult>({ status: 'pending', message: 'Not tested yet' })
  const [publerResult, setPublerResult] = useState<TestResult>({ status: 'pending', message: 'Not tested yet' })
  const [testing, setTesting] = useState(false)

  const testSupabase = async () => {
    setSupabaseResult({ status: 'pending', message: 'Testing...' })
    try {
      const res = await fetch('/api/test/supabase')
      const data = await res.json()
      setSupabaseResult(data)
    } catch (error: any) {
      setSupabaseResult({ status: 'error', message: 'Request failed', error: error.message })
    }
  }

  const testGHL = async () => {
    setGhlResult({ status: 'pending', message: 'Testing...' })
    try {
      const res = await fetch('/api/test/credentials')
      const data = await res.json()
      setGhlResult(data)
    } catch (error: any) {
      setGhlResult({ status: 'error', message: 'Request failed', error: error.message })
    }
  }

  const testPubler = async () => {
    setPublerResult({ status: 'pending', message: 'Testing...' })
    try {
      const res = await fetch('/api/publer/accounts')
      const data = await res.json()
      if (Array.isArray(data)) {
        setPublerResult({ 
          status: 'success', 
          message: `Found ${data.length} accounts`,
          details: { accounts: data.map((a: any) => a.name).join(', ') }
        })
      } else {
        setPublerResult({ status: 'error', message: 'Unexpected response', details: data })
      }
    } catch (error: any) {
      setPublerResult({ status: 'error', message: 'Request failed', error: error.message })
    }
  }

  const testAll = async () => {
    setTesting(true)
    await testSupabase()
    await testGHL()
    await testPubler()
    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'pending': return <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    }
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Health Check</h1>
            <p className="text-muted-foreground mt-2">Test your integrations and configurations</p>
          </div>
          <Button onClick={testAll} disabled={testing} size="lg">
            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Test All
          </Button>
        </div>

        {/* Supabase Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(supabaseResult.status)}
                <CardTitle>Supabase Database</CardTitle>
              </div>
              {getStatusBadge(supabaseResult.status)}
            </div>
            <CardDescription>PostgreSQL database for storing posts and customer data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testSupabase} variant="outline" size="sm">
                Test Connection
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="font-medium">{supabaseResult.message}</p>
              {supabaseResult.details && (
                <pre className="text-xs bg-background p-2 rounded overflow-auto">
                  {JSON.stringify(supabaseResult.details, null, 2)}
                </pre>
              )}
              {supabaseResult.error && (
                <p className="text-sm text-red-500">Error: {supabaseResult.error}</p>
              )}
              {supabaseResult.hint && (
                <p className="text-sm text-yellow-600">💡 {supabaseResult.hint}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* GHL Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(ghlResult.status)}
                <CardTitle>GoHighLevel (GHL)</CardTitle>
              </div>
              {getStatusBadge(ghlResult.status)}
            </div>
            <CardDescription>CRM integration for customer management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testGHL} variant="outline" size="sm">
                Test Credentials
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="font-medium">{ghlResult.message}</p>
              {ghlResult.details && (
                <pre className="text-xs bg-background p-2 rounded overflow-auto">
                  {JSON.stringify(ghlResult.details, null, 2)}
                </pre>
              )}
              {ghlResult.error && (
                <p className="text-sm text-red-500">Error: {ghlResult.error}</p>
              )}
              {ghlResult.hint && (
                <p className="text-sm text-yellow-600">💡 {ghlResult.hint}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Publer Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(publerResult.status)}
                <CardTitle>Publer API</CardTitle>
              </div>
              {getStatusBadge(publerResult.status)}
            </div>
            <CardDescription>Social media scheduling service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testPubler} variant="outline" size="sm">
                Test Accounts
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="font-medium">{publerResult.message}</p>
              {publerResult.details && (
                <pre className="text-xs bg-background p-2 rounded overflow-auto">
                  {JSON.stringify(publerResult.details, null, 2)}
                </pre>
              )}
              {publerResult.error && (
                <p className="text-sm text-red-500">Error: {publerResult.error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">Configuration Checklist</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Check your <code className="bg-background px-1 rounded">.env.local</code> file</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Supabase: Set <code className="bg-background px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>GHL: Already configured ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Publer: Add <code className="bg-background px-1 rounded">PUBLER_API_KEY</code> for real accounts</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
