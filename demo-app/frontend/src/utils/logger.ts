import logger from 'loglevel'

export const logLevels = ['trace', 'debug', 'info', 'warn', 'error'] as const

export type LogLevel = (typeof logLevels)[number]

/**
 * log function
 * @param msg
 * @param args
 */
export const createLog =
  (level: LogLevel) =>
  (msg: string, ...args: unknown[]) => {
    level = logLevels.includes(level) ? level : 'info'
    return logger[level](`[ai-workshop]: ${msg}`, ...args)
  }

export const info = createLog('info')

// export const info = log

export const trace = createLog('trace')

// export const log = createLog('debug')
export const log = console.log

export const debug = createLog('debug')

export const warn = createLog('warn')

export const error = createLog('error')

export { logger }
