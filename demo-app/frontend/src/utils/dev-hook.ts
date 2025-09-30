import { log } from '@/utils'

const DEV_HOOK_ATTRIBUTE = 'data-dev-hook'

declare global {
  interface Window {
    [key: string]: any
  }
}

export const isDev: boolean = window
  ? window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  : false

export interface IDevHookOptions<T extends Record<string, any>> {
  /** name of dev hook (for console), defaults to "hook"*/
  name?: string
  /** optional initial properties to set to dev hook */
  props?: Partial<T>
}

/**
 * Creates a global "hook" that can be used from the console in development mode
 * @param options - options for creating a dev hook
 *
 * @example
 * ```ts
 * createHook({ name: 'hook', props: { test: 'test prop' }})
 *
 * // now "hook" variable is available locally
 * hook.test // 'test prop'
 * ```
 */
export function createHook<T extends Record<string, any>>(
  options?: IDevHookOptions<T>,
): Partial<T> {
  const { name = 'hook', props = {} } = options ?? {}
  const storageHook = (localStorage?.getItem('devHook') ?? '').toLowerCase()
  const hasLocalStorageHook = localStorage && ['true', '1'].includes(storageHook)
  if (isDev || hasLocalStorageHook) {
    // add script to document
    if (!getScript(name)) {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.setAttribute(DEV_HOOK_ATTRIBUTE, name)
      script.textContent = `${name}={};`
      document.body.appendChild(script)
      log(`added dev-hook: "${name}"`)
    }
    if (props) {
      Object.assign(window[name], props)
    }
    return window[name] as Partial<T>
  }
  return { ...(props ?? {}) } as Partial<T> // this will only be available in local scope in non-dev mode!
}

function getScript(name = 'hook'): HTMLElement | null {
  return document.querySelector(`script[${DEV_HOOK_ATTRIBUTE}=${name}]`)
}

/**
 * Removes a global dev "hook"
 * @param {String} [name="hook"] - name of dev hook to remove
 */
export function removeHook(name = 'hook'): void {
  const script = getScript(name)
  if (script) {
    document.body.removeChild(script)
    if (window && name in window) {
      delete window[name]
    }
    log(`removed dev-hook: "${name}"`)
  }
}

/**
 * updates the specified dev hook with properties from an object
 * @param {Record<string, any>} obj - object to mixin to dev hook
 * @param {String} [name="hook"] - name of dev hook
 *
 * @example
 * updateHook({georgia: 'bulldogs', hello: 'world'});
 * hook.georgia // -> 'bulldogs'
 */
export function updateHook<T>(obj: Partial<T>, name = 'hook'): void {
  if (window && name in window) {
    for (const key in obj) {
      window[name][key] = obj[key]
    }
  }
}

/**
 * fetches the dev hook if available
 * @param name - the dev hook name
 * @returns the dev hook object
 */
export function getHook<T = any>(name = 'hook'): T {
  if (window && name in window) {
    return window[name] as T
  }
  return {} as T
}

/**
 * Removes a property from the specified dev hook
 * @param {String} prop - name of property to remove from dev hook
 * @param {String} [name="hook"] - name of dev hook
 */
export function removeProp(prop: string, name = 'hook'): void {
  if (window && name in window) {
    delete window[name][prop]
  }
}
