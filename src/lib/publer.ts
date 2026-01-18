
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
      // Publer API requires networks object with platform-specific content
      // Format: { bulk: { state: "..." }, posts: [{ accounts: [...], networks: {...} }] }
      
      // Build networks object - each platform gets the same text
      // In a real app, you might have platform-specific overrides
      const networks: any = {
          facebook: { text: payload.text },
          instagram: { text: payload.text },
          twitter: { text: payload.text },
          telegram: { text: payload.text },
          linkedin: { text: payload.text }
      };

      const post: any = {
          accounts: payload.accounts, // Array of account IDs
          networks: networks
      };

      // Add media if present
      if (payload.media && payload.media.length > 0) {
          // Media needs to be added to each network
          Object.keys(networks).forEach(platform => {
              networks[platform].media_urls = payload.media;
          });
      }

      // Add schedule time if present
      if (payload.scheduled_at) {
          post.scheduled_at = payload.scheduled_at;
      }

      const requestBody = {
          bulk: {
              state: payload.scheduled_at ? "scheduled" : "scheduled"
          },
          posts: [post]
      };

      // Use /posts/schedule for both scheduled and immediate posts
      return this.fetch('/posts/schedule', {
          method: 'POST',
          body: JSON.stringify(requestBody)
      });
  }
}
