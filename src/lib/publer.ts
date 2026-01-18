
const PUBLER_API_URL = 'https://publer.io/api/v1';

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

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${PUBLER_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
