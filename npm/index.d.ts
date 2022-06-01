type TRet = any;
export type State<T> = (val: T | ((prev: T) => T)) => void;
export type Reducer<T, U> = (prev: T, action: U) => T;
export function useEffect(cb: CallableFunction, deps?: TRet[]): void;
export function useState<T>(val: T | ((prev?: TRet) => T)): [T, State<T>];
export function useReducer<T, U>(
  reducer: Reducer<T, U>,
  initState: T,
  initLazy?: (state: T) => TRet
): [T, (action: U) => void];
export function render(fn: (props?: TRet) => TRet, elem: TRet): void;
export function renderToString(fn: ((props?: TRet) => TRet) | string): string;
export const html: TRet;
