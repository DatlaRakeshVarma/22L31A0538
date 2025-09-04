export interface ShortenedURL {
  id: string;
  originalUrl: string;
  shortCode: string;
  validityMinutes: number;
  createdAt: Date;
  expiryDate: Date;
  clickCount: number;
  isActive: boolean;
}

export interface ClickData {
  id: string;
  shortUrlId: string;
  timestamp: Date;
  userAgent: string;
  source: string;
  location: string;
}

export interface URLFormData {
  originalUrl: string;
  validityMinutes: number;
  customShortCode?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}