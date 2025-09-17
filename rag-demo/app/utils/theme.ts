import type { ColorTheme } from "~/typings"

export const getPreferredBrowserColorScheme = (): ColorTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

