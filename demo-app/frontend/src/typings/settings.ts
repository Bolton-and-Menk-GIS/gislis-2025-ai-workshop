export type ColorTheme = 'light' | 'dark'

export type AppTheme = ColorTheme | 'auto'

export interface UserSettings {
  theme: AppTheme;
}