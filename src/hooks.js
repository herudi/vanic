import { useState } from "./index.js";

export function useReducer(reducer, init, initLazy) {
  // soon
  const [state, setState] = useState(
    initLazy !== undefined ? initLazy(init) : init
  );
  return [
    state,
    (action) => {
      setState(reducer(state, action));
    },
  ];
}

export function useCallback(cb, deps) {
  // soon
}
export function useMemo(cb, deps) {
  // soon
}
export function useContext(name) {
  // soon
}
