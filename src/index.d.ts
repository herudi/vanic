type TRet = any;
export function useEffect(cb: CallableFunction, deps?: TRet[]): void;
export function useState(val: TRet): TRet[];
export function render(fn: () => TRet, elem?: TRet): string;
export function h(...args: TRet): TRet;
export const Fragment: TRet;
export const html: TRet;
