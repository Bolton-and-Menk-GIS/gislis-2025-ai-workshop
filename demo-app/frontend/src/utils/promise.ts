/**
 * create a new deferred promise
 * 
 * @example
 * interface UserInfo {
 *   name: string;
 *   email: string;
 *   username: string;
 * }
 * 
 * // create a new deferred promise that can be resolved on demand
 * const user = new Deferred<UserInfo>()
 * 
 * // called when user logs in
 * onUserAuthenticated(user: UserInfo) {
 *   user.resolve(user)
 * }
 * 
 * // the "user" object can be used anywhere
 * user.promise.then((userInfo)=> {
 *   // do something with user
 *   console.log("user is: ", userInfo)
 * })
 * 
 * // or async/await
 * async function main(){
 *   const userInfo = await user.promise
 *   // do something with user info
 *   console.log("user is: ", userInfo)
 * }
 */
export class Deferred<T = unknown> {
  private _resolve: (value: T) => void = () => undefined;
  private _reject: <Reason = unknown>(value?: Reason) => void = () => undefined
  private _value?: T = undefined
  private _hasResolved = false

  private _promise: Promise<T> = new Promise<T>((resolve, reject) => {
      this._reject = reject;
      this._resolve = resolve;
  })

  get promise(): Promise<T> {
    return this._promise as Promise<T>;
  }

  get value(): T | undefined {
    return this._value
  }

  get hasResolved() {
    return this._hasResolved
  }

  resolve(value: T) {
    this._value = value
    this._hasResolved = true;
    this._resolve(value);
  }

  reject<Reason = unknown>(value?: Reason) {
    this._reject(value);
  }
}

/**
 * debounce a function
 * 
 * @see https://blog.webdevsimplified.com/2022-03/debounce-vs-throttle/
 *  
 * @param cb - the callback function
 * @param delay - the time to delay in milliseconds
 * @returns 
 */
export function debounce<F extends (...args: unknown[])=> void>(cb: F, delay = 250) {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: Parameters<F>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args) 
    }, delay)
  }
}