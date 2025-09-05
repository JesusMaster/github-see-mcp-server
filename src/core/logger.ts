const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
const logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

// Custom logger with level filtering
export const logger = {
    debug: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.debug) {
            console.debug('[DEBUG]', ...args);
        }
    },
    info: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.info) {
            console.info('[INFO]', ...args);
        }
    },
    warn: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.warn) {
            console.warn('[WARN]', ...args);
        }
    },
    error: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.error) {
            console.error('[ERROR]', ...args);
        }
    }
};