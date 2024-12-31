type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export class TokenLogger {
  private static log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    console.log(JSON.stringify(entry));
    return entry;
  }

  static info(message: string, data?: any) {
    return this.log('info', message, data);
  }

  static warn(message: string, data?: any) {
    return this.log('warn', message, data);
  }

  static error(message: string, error?: any) {
    return this.log('error', message, {
      error: error?.message || error,
      stack: error?.stack
    });
  }
}