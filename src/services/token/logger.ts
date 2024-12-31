type LogLevel = 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private logToConsole(level: LogLevel, message: string, data?: any) {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    switch (level) {
      case 'info':
        console.log(`[TOKEN] ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`[TOKEN] ${message}`, data || '');
        break;
      case 'error':
        console.error(`[TOKEN] ${message}`, data || '');
        break;
    }

    return logMessage;
  }

  info(message: string, data?: any) {
    return this.logToConsole('info', message, data);
  }

  warn(message: string, data?: any) {
    return this.logToConsole('warn', message, data);
  }

  error(message: string, data?: any) {
    return this.logToConsole('error', message, data);
  }
}

export const TokenLogger = new Logger();