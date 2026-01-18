/**
 * GoHighLevel API Client
 * Handles media uploads and other GHL API interactions
 */

const GHL_API_BASE = process.env.GHL_API_DOMAIN || 'https://services.leadconnectorhq.com';

export interface GHLMediaUploadResponse {
  uploadUrl: string;
  url: string;
  fileKey: string;
}

export class GHLClient {
  private accessToken: string;
  private locationId: string;

  constructor(accessToken: string, locationId: string) {
    this.accessToken = accessToken;
    this.locationId = locationId;
  }

  /**
   * Upload a file to GHL Media Library
   * @param file - The file to upload
   * @returns Promise with the uploaded media URL
   */
  async uploadMedia(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const formData = new FormData();

    // Create a Blob from the Buffer
    const blob = new Blob([file], { type: contentType });
    formData.append('file', blob, fileName);
    formData.append('locationId', this.locationId);

    const response = await fetch(`${GHL_API_BASE}/medias/upload-file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL Media Upload Failed: ${response.status} - ${error}`);
    }

    const data = await response.json() as GHLMediaUploadResponse;

    // Return the public URL of the uploaded media
    return data.url;
  }

  /**
   * Get location details
   */
  async getLocation() {
    const response = await fetch(`${GHL_API_BASE}/locations/${this.locationId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Version': '2021-07-28',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch location: ${response.status}`);
    }

    return response.json();
  }
}
