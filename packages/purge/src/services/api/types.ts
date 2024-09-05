export interface ApiPurgeResponse {
  state?: 'executed' | 'pending';
  data?: {
    items: string[];
  };
  error?: {
    message: string;
    operation: string;
  };
}
