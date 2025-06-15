import { ref } from 'vue';
import type { Logger } from '../types';

const globalLogger = ref<Logger | null>(null);

const defaultLogger: Logger = {
  log: (...args) => console.log('[Report Module]', ...args),
  warn: (...args) => console.warn('[Report Module]', ...args),
  error: (...args) => console.error('[Report Module]', ...args),
  debug: (...args) => console.debug('[Report Module]', ...args),
};

export const useLogger = () => {
  const setLogger = (logger: Logger) => {
    globalLogger.value = logger;
  };

  const getLogger = (): Logger => {
    return globalLogger.value || defaultLogger;
  };

  const log = (...args: any[]) => {
    getLogger().log(...args);
  };

  const warn = (...args: any[]) => {
    getLogger().warn(...args);
  };

  const error = (...args: any[]) => {
    getLogger().error(...args);
  };

  const debug = (...args: any[]) => {
    getLogger().debug(...args);
  };

  return {
    setLogger,
    getLogger,
    log,
    warn,
    error,
    debug,
  };
};
