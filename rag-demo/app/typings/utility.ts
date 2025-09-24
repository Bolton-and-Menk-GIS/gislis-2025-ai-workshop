export type ExtractProperties<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: (event: T[K]) => void
}

// @ts-ignore
export type NonFunctionProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
}