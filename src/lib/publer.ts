
const PUBLER_API_URL = 'https://app.publer.io/api/v1';

export interface PublerAccount {
  id: string;
  name: string;
  type: string; // 'facebook', 'instagram', 'twitter', etc.
  picture: string;
  url: string;
}

export interface PublerPostPayload {
  accounts: string[]; // Account IDs
  text: string;
  media?: string[]; // URLs of media
  scheduled_at?: string; // ISO string, if empty/null = post now (conceptually)
}

export class PublerService {
  private apiKey: string;
  private workspaceId: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
  }

  // Helper to ensure we have a workspace ID
  private async getWorkspaceId(): Promise<string> {
    if (this.workspaceId) return this.workspaceId;
    
    // Fetch workspaces to find the default one
    const res = await fetch(`${PUBLER_API_URL}/workspaces`, {
        headers: {
            'Authorization': `Bearer-API ${this.apiKey}`,
            'Content-Type': 'application/json',
        }
    });

    if (!res.ok) throw new Error("Failed to fetch Publer workspaces");
    
    const workspaces = await res.json();
    if (!workspaces || workspaces.length === 0) {
        throw new Error("No Publer workspaces found for this API key");
    }
    
    this.workspaceId = workspaces[0].id;
    return this.workspaceId!;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    // Ensure we have a workspace ID (except when fetching workspaces itself)
    let headers: Record<string, string> = {
        'Authorization': `Bearer-API ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (endpoint !== '/workspaces') {
         const wsId = await this.getWorkspaceId();
         headers['Publer-Workspace-Id'] = wsId;
    }

    const res = await fetch(`${PUBLER_API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Publer API Error ${res.status}: ${errorBody}`);
    }

    return res.json();
  }

  async getAccounts(): Promise<PublerAccount[]> {
    // Determine the user's workspace? 
    // Usually API key is tied to a user/workspace, or we default to the first one.
    // For now, let's just GET /accounts (assuming the key has 'accounts' scope and defaults work).
    // Note: Documentation says we might need Publer-Workspace-Id header if multiple.
    // We'll trust the default for now or fetch workspaces first if needed.
    
    // Attempt simple fetch first
    return this.fetch('/accounts');
  }

  async createPost(payload: PublerPostPayload) {
      // If scheduled_at is present, use standard POST /posts (which schedules)
      // typically Publer has endpoint structure like:
      // POST /posts (with creating a draft or scheduled)
      
      // Based on docs summary:
      // "POST /api/v1/posts/schedule"
      
      const body: any = {
          text: payload.text,
          media_urls: payload.media,
          account_ids: payload.accounts,
      };

      if (payload.scheduled_at) {
          body.scheduled_at = payload.scheduled_at;
      }

      // If we want to post IMMEDIATELY, we usually omit scheduled_at or use a specific flag/endpoint.
      // Search result said "POST /api/v1/posts/schedule/publish".
      // Let's use that if scheduled_at is missing.
      
      const endpoint = payload.scheduled_at 
        ? '/posts' // Standard 'create post' which schedules if date is there, or drafts?
                   // Actually docs often say POST /posts creates a post.
        : '/posts'; // We will assume POST /posts works for both if parameters are right, 
                    // OR we'll try to guess based on standard REST.
                    // Let's rely on the user's request: "post them imediatly".
      
      // Refined based on search:
      // endpoint: /posts
      // if immediate, we might just set scheduled_at to null? 
      // or use that valid endpoint /posts/schedule/publish (seems distinct)
      
      // Let's try standard POST /posts first content content.
      return this.fetch('/posts', {
          method: 'POST',
          body: JSON.stringify(body)
      });
  }
}
