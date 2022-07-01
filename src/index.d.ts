export type TRet = any;
declare global {
  export namespace JSX {
    interface IntrinsicElements {
      // @ts-ignore
      [k: string]: TRet;
    }
  }
}
export type State<T> = (val: T | ((prev: T) => T)) => void;
export type Reducer<S, A> = (state: S, action: A) => S;
export function useEffect(cb: CallableFunction, deps?: TRet[]): void;
export function useLayoutEffect(cb: CallableFunction, deps?: TRet[]): void;
export function useState<T>(
  val: T | ((prev?: TRet) => T)
): [T, State<T>, () => T];
export function useRef<T>(initValue: T): {
  current: T;
  ref: () => T;
};
export function useCallback<T extends Function>(cb: T, deps: TRet[]): T;
export function useMemo<T>(val: () => T, deps?: TRet[]): T;
export function useReducer<S, A>(
  reducer: Reducer<S, A>,
  initState: S,
  initLazy?: (initState: S) => TRet
): [S, (action: A) => void];
export function useContext<C>(context: TRet): C;
export function createContext<D>(defaultVal?: D): {
  Provider: (value: TRet | undefined, fn: () => TRet) => TRet;
};
export function render(fn: (props?: TRet) => TRet, elem: TRet): void;
export function renderToString(fn: ((props?: TRet) => TRet) | string): string;
export function comp(component: TRet): TRet;
export function h(tag: TRet, ...args: TRet): TRet;
export const html: TRet;
export const Fragment: TRet;
