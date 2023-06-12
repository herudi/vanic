// deno-lint-ignore-file
export type TRet = any;
declare global {
  export namespace JSX {
    // @ts-ignore: elem
    type Element = TRet;
    interface IntrinsicElements {
      // @ts-ignore: elem
      [k: string]: TRet;
    }
  }
}
type JsxProps = {
  children?: TRet;
};
export type FC<T extends unknown = unknown> = (
  props: JsxProps & T,
) => JSX.Element;
export type State<T> = (val: T | ((prev: T) => T)) => void;
export type Reducer<S, A> = (state: S, action: A) => S;
export function useEffect(cb: CallableFunction, deps?: TRet[]): void;
export function useLayoutEffect(cb: CallableFunction, deps?: TRet[]): void;
export function useState<T>(
  val: T | ((prev?: TRet) => T),
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
  initLazy?: (initState: S) => TRet,
): [S, (action: A) => void];
export function useContext<C>(context: TRet): C;
export function createContext<D>(initial?: D): {
  Provider: (props: TRet) => TRet;
};
export function useId(prefix?: string): string;
export function render(elem: JSX.Element, target: HTMLElement): void;
export function renderToString(elem: JSX.Element): string;
export function isValidElement(elem: JSX.Element): boolean;
export function h(type: string | TRet, props: TRet, ...args: TRet): TRet;
export const html: TRet;
export const Fragment: FC;
