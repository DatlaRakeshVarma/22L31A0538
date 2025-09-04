import { ShortenedURL, ClickData, URLFormData, ValidationError } from '../types';
import { logger } from '../utils/logger';

class URLService {
  private urls: ShortenedURL[] = [];
  private clicks: ClickData[] = [];
  private readonly STORAGE_KEY = 'urlShortenerData';
  private readonly CLICKS_KEY = 'urlShortenerClicks';

  constructor() {
    this.loadFromStorage();
    logger.info('URLService initialized', { urlCount: this.urls.length });
  }

  private loadFromStorage(): void {
    try {
      const storedUrls = localStorage.getItem(this.STORAGE_KEY);
      const storedClicks = localStorage.getItem(this.CLICKS_KEY);
      
      if (storedUrls) {
        this.urls = JSON.parse(storedUrls).map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          expiryDate: new Date(url.expiryDate)
        }));
      }
      
      if (storedClicks) {
        this.clicks = JSON.parse(storedClicks).map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        }));
      }
      
      logger.info('Data loaded from storage', { 
        urlCount: this.urls.length, 
        clickCount: this.clicks.length 
      });
    } catch (error) {
      logger.error('Failed to load data from storage', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.urls));
      localStorage.setItem(this.CLICKS_KEY, JSON.stringify(this.clicks));
      logger.debug('Data saved to storage');
    } catch (error) {
      logger.error('Failed to save data to storage', error);
    }
  }

  private generateShortCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private isShortCodeUnique(shortCode: string): boolean {
    return !this.urls.some(url => url.shortCode === shortCode);
  }

  public validateUrl(formData: URLFormData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate URL format
    try {
      new URL(formData.originalUrl);
    } catch {
      errors.push({
        field: 'originalUrl',
        message: 'Please enter a valid URL (including http:// or https://)'
      });
    }

    // Validate validity period
    if (formData.validityMinutes < 1 || formData.validityMinutes > 43200) { // Max 30 days
      errors.push({
        field: 'validityMinutes',
        message: 'Validity period must be between 1 minute and 30 days (43200 minutes)'
      });
    }

    // Validate custom shortcode if provided
    if (formData.customShortCode) {
      if (formData.customShortCode.length < 3 || formData.customShortCode.length > 20) {
        errors.push({
          field: 'customShortCode',
          message: 'Custom shortcode must be between 3 and 20 characters'
        });
      }

      if (!/^[a-zA-Z0-9-_]+$/.test(formData.customShortCode)) {
        errors.push({
          field: 'customShortCode',
          message: 'Custom shortcode can only contain letters, numbers, hyphens, and underscores'
        });
      }

      if (!this.isShortCodeUnique(formData.customShortCode)) {
        errors.push({
          field: 'customShortCode',
          message: 'This shortcode is already taken. Please choose another one.'
        });
      }
    }

    return errors;
  }

  public createShortUrl(formData: URLFormData): ShortenedURL {
    logger.info('Creating short URL', formData);

    const validation = this.validateUrl(formData);
    if (validation.length > 0) {
      logger.warn('Validation failed for URL creation', { errors: validation, formData });
      throw new Error(validation.map(e => e.message).join(', '));
    }

    let shortCode = formData.customShortCode;
    
    if (!shortCode) {
      do {
        shortCode = this.generateShortCode();
      } while (!this.isShortCodeUnique(shortCode));
    }

    const createdAt = new Date();
    const expiryDate = new Date(createdAt.getTime() + formData.validityMinutes * 60 * 1000);

    const shortenedUrl: ShortenedURL = {
      id: crypto.randomUUID(),
      originalUrl: formData.originalUrl,
      shortCode,
      validityMinutes: formData.validityMinutes,
      createdAt,
      expiryDate,
      clickCount: 0,
      isActive: true
    };

    this.urls.push(shortenedUrl);
    this.saveToStorage();
    
    logger.info('Short URL created successfully', { 
      id: shortenedUrl.id, 
      shortCode, 
      originalUrl: formData.originalUrl 
    });

    return shortenedUrl;
  }

  public getUrls(): ShortenedURL[] {
    return [...this.urls];
  }

  public getActiveUrls(): ShortenedURL[] {
    const now = new Date();
    return this.urls.filter(url => url.isActive && url.expiryDate > now);
  }

  public getUrlByShortCode(shortCode: string): ShortenedURL | null {
    return this.urls.find(url => url.shortCode === shortCode) || null;
  }

  public recordClick(shortCode: string, userAgent: string = '', source: string = 'direct'): ClickData | null {
    const url = this.getUrlByShortCode(shortCode);
    
    if (!url) {
      logger.warn('Attempted to record click for non-existent shortcode', { shortCode });
      return null;
    }

    const now = new Date();
    if (url.expiryDate <= now) {
      logger.warn('Attempted to record click for expired URL', { shortCode, expiryDate: url.expiryDate });
      return null;
    }

    if (!url.isActive) {
      logger.warn('Attempted to record click for inactive URL', { shortCode });
      return null;
    }

    const clickData: ClickData = {
      id: crypto.randomUUID(),
      shortUrlId: url.id,
      timestamp: now,
      userAgent,
      source,
      location: 'Unknown' // In a real app, this could be determined from IP
    };

    url.clickCount++;
    this.clicks.push(clickData);
    this.saveToStorage();

    logger.info('Click recorded', { 
      shortCode, 
      clickId: clickData.id, 
      totalClicks: url.clickCount 
    });

    return clickData;
  }

  public getClicksForUrl(urlId: string): ClickData[] {
    return this.clicks.filter(click => click.shortUrlId === urlId);
  }

  public getAllClicks(): ClickData[] {
    return [...this.clicks];
  }

  public deactivateUrl(shortCode: string): boolean {
    const url = this.getUrlByShortCode(shortCode);
    if (url) {
      url.isActive = false;
      this.saveToStorage();
      logger.info('URL deactivated', { shortCode });
      return true;
    }
    logger.warn('Attempted to deactivate non-existent URL', { shortCode });
    return false;
  }

  public cleanupExpiredUrls(): number {
    const now = new Date();
    const beforeCount = this.urls.length;
    
    this.urls = this.urls.filter(url => url.expiryDate > now);
    
    const removedCount = beforeCount - this.urls.length;
    if (removedCount > 0) {
      this.saveToStorage();
      logger.info('Cleaned up expired URLs', { removedCount });
    }
    
    return removedCount;
  }
}

export const urlService = new URLService();