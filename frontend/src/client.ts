/**
 * A2UI API Client
 * Communicates with the serverless Gemini API endpoint
 */

export interface A2UIMessage {
  createSurface?: {
    surfaceId: string;
    catalogId: string;
  };
  updateComponents?: {
    surfaceId: string;
    components: Component[];
  };
  updateDataModel?: {
    surfaceId: string;
    path?: string;
    op?: 'add' | 'replace' | 'remove';
    value?: unknown;
  };
  deleteSurface?: {
    surfaceId: string;
  };
}

export interface Component {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface ChatResponse {
  messages: A2UIMessage[];
  error?: string;
}

export class A2UIClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async send(message: string): Promise<A2UIMessage[]> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const data: ChatResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.messages || [];
  }
}

