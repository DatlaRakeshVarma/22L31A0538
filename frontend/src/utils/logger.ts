interface LogLevel {
  ERROR: 'ERROR';
  WARN: 'WARN';
  INFO: 'INFO';
  DEBUG: 'DEBUG';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: any;
  source?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private createLogEntry(level: keyof LogLevel, message: string, data?: any, source?: string): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data,
      source: source || 'URLShortener'
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('urlShortenerLogs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to persist logs to localStorage:', error);
    }
  }

  public error(message: string, data?: any, source?: string): void {
    const entry = this.createLogEntry('ERROR', message, data, source);
    this.addLog(entry);
    console.error(`[${entry.timestamp}] ERROR [${entry.source}]: ${message}`, data);
  }

  public warn(message: string, data?: any, source?: string): void {
    const entry = this.createLogEntry('WARN', message, data, source);
    this.addLog(entry);
    console.warn(`[${entry.timestamp}] WARN [${entry.source}]: ${message}`, data);
  }

  public info(message: string, data?: any, source?: string): void {
    const entry = this.createLogEntry('INFO', message, data, source);
    this.addLog(entry);
    console.info(`[${entry.timestamp}] INFO [${entry.source}]: ${message}`, data);
  }

  public debug(message: string, data?: any, source?: string): void {
    const entry = this.createLogEntry('DEBUG', message, data, source);
    this.addLog(entry);
    console.debug(`[${entry.timestamp}] DEBUG [${entry.source}]: ${message}`, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('urlShortenerLogs');
    } catch (error) {
      console.warn('Failed to clear logs from localStorage:', error);
    }
  }

  public initializeFromStorage(): void {
    try {
      const storedLogs = localStorage.getItem('urlShortenerLogs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Initialize from localStorage when module is loaded
logger.initializeFromStorage();