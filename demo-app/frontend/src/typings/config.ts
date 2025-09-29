export interface AppConfig {
  app: {
    title: string
    description: string
  }
  demos: {
    ask: DemoConfig
    survey: DemoConfig
    rag: DemoConfig
  }
}

export interface MapConfig {
  webmapId: string;
}

export interface DemoConfig {
  name: string;
  title: string
  description: string
  map?: MapConfig
}
