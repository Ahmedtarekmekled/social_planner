
const PUBLER_API_URL = 'https://app.publer.com/api/v1';

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
      throw new Error(`Publer API Error ${res.status} at ${endpoint}: ${errorBody}`);
    }

    return res.json();
  }

  async getAccounts(): Promise<PublerAccount[]> {
    return this.fetch('/accounts');
  }

  private getTypeKey(type: string): string {
    if (type.startsWith('ig_')) return 'instagram';
    if (type.startsWith('fb_')) return 'facebook';
    if (type === 'twitter') return 'twitter';
    if (type === 'linkedin') return 'linkedin';
    if (type === 'telegram') return 'telegram';
    // Add other mappings as needed
    return type;
  }

  private async pollJob(jobId: string): Promise<any> {
    let attempts = 0;
    while (attempts < 20) { // Poll for up to 40 seconds
      attempts++;
      const job = await this.fetch(`/jobs/${jobId}`);
      if (job.status === 'complete' || job.status === 'completed') {
        return job.payload;
      } else if (job.status === 'failed') {
        throw new Error(`Publer Job Failed: ${JSON.stringify(job.error)}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error("Publer Job Timed Out");
  }

  private async uploadMedia(url: string): Promise<string> {
    // 1. Initiate Upload
    const res = await this.fetch('/media/from-url', {
      method: 'POST',
      body: JSON.stringify({
        media: [{ url }]
      })
    });

    if (!res.job_id) {
      // Sometimes it might return immediately? Check response structure.
      // If no job_id, assume failure for now or check if it returned media directly.
      // Based on debug, it returns job_id.
      throw new Error("No Job ID returned from media upload");
    }

    // 2. Poll for completion
    const payload = await this.pollJob(res.job_id);

    if (payload && payload.length > 0 && payload[0].id) {
      return payload[0].id;
    }

    throw new Error("Job completed but no media ID found");
  }

  async createPost(payload: PublerPostPayload) {
    // 1. Get detailed account info to know types
    const allAccounts = await this.getAccounts();
    const targetAccounts = allAccounts.filter(a => payload.accounts.includes(a.id));

    if (targetAccounts.length === 0) {
      throw new Error("No valid accounts found for the provided IDs");
    }

    // 2. Upload Media if present
    const mediaIds: string[] = [];
    let mediaType = 'photo'; // Default to photo if media exists
    if (payload.media && payload.media.length > 0) {
      for (const url of payload.media) {
        if (url.endsWith('.mp4') || url.includes('video')) mediaType = 'video';
        try {
          const id = await this.uploadMedia(url);
          mediaIds.push(id);
        } catch (e) {
          console.error(`Failed to upload media ${url}:`, e);
          throw e;
        }
      }
    }

    // 3. Build Networks Object
    const networks: any = {};
    const uniqueTypes = new Set(targetAccounts.map(a => this.getTypeKey(a.type)));

    uniqueTypes.forEach(type => {
      networks[type] = {
        text: payload.text
      };
      if (mediaIds.length > 0) {
        networks[type].media_ids = mediaIds;
        networks[type].type = mediaType;
      } else {
        networks[type].type = 'status';
      }
    });

    // 4. Construct Payload
    const post: any = {
      accounts: payload.accounts,
      networks: networks
    };

    // If scheduled_at is missing, default to now for "Post Now" behavior
    if (payload.scheduled_at) {
      post.scheduled_at = payload.scheduled_at;
    } else {
      post.scheduled_at = new Date().toISOString();
    }

    const requestBody = {
      bulk: {
        state: "scheduled"
      },
      posts: [post]
    };

    return this.fetch('/posts/schedule', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
  }
}
