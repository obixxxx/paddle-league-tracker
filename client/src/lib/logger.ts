/**
 * Simple logger utility with support for different log levels
 * and potential integration with external error tracking services
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Default minimum log level - change to configure logging verbosity
let currentLogLevel: LogLevel = 
  (import.meta.env.MODE === 'development') 
    ? LogLevel.DEBUG 
    : LogLevel.WARN;

// Map log levels to console methods
const logMethods = {
  [LogLevel.DEBUG]: console.debug,
  [LogLevel.INFO]: console.info,
  [LogLevel.WARN]: console.warn,
  [LogLevel.ERROR]: console.error,
};

// Log level priorities (for filtering)
const logLevelPriority = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Set the minimum log level
 */
export const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
};

/**
 * Main logging function
 */
export const log = (
  level: LogLevel,
  message: string,
  data?: any,
  options?: {
    tags?: string[];
    context?: Record<string, any>;
  }
): void => {
  // Skip logging if below current log level
  if (logLevelPriority[level] < logLevelPriority[currentLogLevel]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logFn = logMethods[level];
  
  // Format: [LEVEL] [Timestamp] Message
  const formattedMessage = `[${level.toUpperCase()}] [${timestamp}] ${message}`;
  
  if (data) {
    logFn(formattedMessage, data);
  } else {
    logFn(formattedMessage);
  }

  // If this is an error and we're in production, we could send to an error tracking service
  if (level === LogLevel.ERROR && import.meta.env.MODE === 'production') {
    // Here we would integrate with services like Sentry, LogRocket, etc.
    // Example: sendToErrorTrackingService(message, data, options);
  }
};

// Convenience methods for each log level
export const debug = (message: string, data?: any, options?: any) => log(LogLevel.DEBUG, message, data, options);
export const info = (message: string, data?: any, options?: any) => log(LogLevel.INFO, message, data, options);
export const warn = (message: string, data?: any, options?: any) => log(LogLevel.WARN, message, data, options);
export const error = (message: string, data?: any, options?: any) => log(LogLevel.ERROR, message, data, options);

export default {
  debug,
  info,
  warn,
  error,
  setLogLevel,
};