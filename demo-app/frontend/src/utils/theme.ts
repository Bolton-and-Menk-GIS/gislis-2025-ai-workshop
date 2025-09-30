import { log } from './logger'
import { version as currentVersion } from '@arcgis/core/kernel'
import type { ColorTheme } from '@/typings'

log(`@arcgis/core current version is "${currentVersion}"`)

export const getPreferredBrowserColorScheme = (): ColorTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

/**
 * Get the CDN url for a given version
 * @param version Ex: '4.27' or '3.42'. Defaults to the latest 4.x version.
 */
export function getCdnUrl(version = currentVersion) {
  return `https://js.arcgis.com/${version}/`
}

/**
 * Get the CDN url for a the CSS for a given version and/or theme
 * @param version Ex: '4.25', '3.42', or 'next'. Defaults to the latest 4.x version.
 */
export function getCdnCssUrl(version = currentVersion, theme: ColorTheme = 'light') {
  const baseUrl = getCdnUrl(version)
  return `${baseUrl}esri/themes/${theme}/main.css`
}

export const getLinkId = (theme: string) => `esri-theme-link--${theme ?? 'light'}`

/**
 * finds the esri css link if it exists
 * @param theme - the target theme
 * @returns the theme link element if it exists
 */
export const findEsriCssLink = (theme: ColorTheme = 'light'): HTMLLinkElement | null => {
  const id = getLinkId(theme)
  return document.querySelector(`link#${id}`) as HTMLLinkElement | null
}

/**
 * gets the esri theme link
 * @returns the html link element
 */
export function getEsriThemeLink(
  version = currentVersion,
  theme: ColorTheme = 'light',
  disabled = false,
): HTMLLinkElement {
  const id = getLinkId(theme)
  let link = findEsriCssLink(theme)
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = getCdnCssUrl(version, theme)
    link.disabled = disabled
    link.setAttribute('data-theme', theme)
    document.head.appendChild(link)
    log(`created new esri theme link for version "${version}" and "${theme}" theme: `, link)
  }
  return link
}

/**
 * finds the current esri theme
 * @returns the current theme (light or dark)
 */
export function getCurrentEsriTheme(): ColorTheme {
  const link = getEsriThemeLink()
  return (link?.getAttribute('data-theme') ?? 'light') as ColorTheme
}

/**
 * the calcite class for dark mode
 */
export const calciteDarkModeClass = 'calcite-mode-dark'

/**
 * ensure's the ArcGIS JS API css is loaded and will set the appropriate theme
 * @param theme - the light or dark theme
 * @returns the html link element
 */
export function setEsriTheme(theme?: ColorTheme, version = currentVersion): HTMLLinkElement {
  theme = theme ?? 'light'
  const other = theme === 'light' ? 'dark' : 'light'
  const link = getEsriThemeLink(version, theme)
  const otherLink = findEsriCssLink(other)
  if (otherLink) {
    otherLink.disabled = true
  }
  link.disabled = false
  // update esri ui elements
  // starting at 4.28, esri is incorporating calcite dark mode on load?
  // update the calcite body class and esri-ui classes
  const esriUI = Array.from(document.getElementsByClassName('esri-ui'))
  esriUI.forEach((e) => e.classList.toggle(calciteDarkModeClass, theme === 'dark'))
  document.body.classList.toggle(calciteDarkModeClass, theme === 'dark')

  // make sure to toggle off the dark mode class on any other elements if the theme is light
  if (theme === 'light') {
    const darkModeElements = document.querySelectorAll(`.${calciteDarkModeClass}`)
    darkModeElements.forEach((el) => el.classList.remove(calciteDarkModeClass))
  }

  log(`[mapping-ui]: set esri theme to "${theme}" with link: `, link)
  return link
}
