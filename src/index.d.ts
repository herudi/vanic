type TRet = any;
export type State<T> = (val: T | ((prev: T) => T)) => void;
export function useEffect(cb: CallableFunction, deps?: TRet[]): void;
export function useState<T>(val: T | ((prev?: TRet) => T)): [T, State<T>];
export function render(fn: (props?: TRet) => TRet, elem: TRet): void;
export function renderToString(fn: ((props?: TRet) => TRet) | string): string;
export function h(...args: TRet): TRet;
export const Fragment: TRet;
export const html: TRet;
