import { useState } from "vanic";

// useReducer
export function useReducer(reducer, init, initLazy) {
  const [state, setState] = useState(initLazy !== undefined ? initLazy(init) : init);
  return [
    state,
    (action) => {
      setState(reducer(state, action));
    },
  ];
}