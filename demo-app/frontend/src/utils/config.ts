import yaml from 'js-yaml'
import type { AppConfig } from '@/typings'

/**
 * loads the application config
 * @param path - the path to the config file
 * @returns the app config
 */
export const loadConfig = async (path='./config.yml'): Promise<AppConfig> => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    const yamlText = await response.text();
    const config = yaml.load(yamlText) as AppConfig;
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    throw error
  }

}