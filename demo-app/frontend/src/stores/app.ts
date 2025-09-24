import { computed } from "vue";
// import { Dark } from "quasar";
import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core";
import { getPreferredBrowserColorScheme, setEsriTheme } from "@/utils";
import type { UserSettings, AppTheme, ColorTheme } from "@/typings";

export const useAppState = defineStore('app', ()=> {

  const userSettings = useStorage<UserSettings>('rag-demo', 
    {
      theme: 'auto'
    }, 
    localStorage,
    {
      mergeDefaults: true
    }
  )

  /**
   * will set the default theme based on the users color preferences or the desired theme
   * @param theme - Sets the default theme based on the user's system preference or a specific theme.
   * @returns 
   */
  const setTheme = (theme: AppTheme = 'auto'): ColorTheme => {
    const resolvedTheme = theme === 'auto' ? getPreferredBrowserColorScheme() : theme;
    
    // Set the theme on the document element
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    setEsriTheme(resolvedTheme)
    userSettings.value.theme = resolvedTheme
    return resolvedTheme;
  }

  const loadInitialTheme = ()=> {
    setTheme(userSettings.value.theme ?? 'auto')
  }

  const colorTheme = computed<ColorTheme>(()=> userSettings.value.theme === 'auto' ? getPreferredBrowserColorScheme(): userSettings.value.theme)

  const isDark = computed(()=> colorTheme.value === 'dark')

  const toggleDarkMode = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    userSettings,
    isDark,
    colorTheme,
    setTheme,
    loadInitialTheme,
    toggleDarkMode,
  }

})
