
// Types pour l'API
export interface ApiError {
  error: string;
  details?: string;
}

export interface Verify2FARequest {
  tempToken: string;
  code: string;
}