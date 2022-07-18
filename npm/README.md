## Vanic

A small, Hook-based library for creating Reactive-UI.

Vanic is an `html-attribute` first.

[![ci](https://github.com/herudi/vanic/workflows/ci/badge.svg)](https://github.com/herudi/vanic)
[![npm version](https://img.shields.io/badge/npm-0.0.23-blue.svg)](https://npmjs.org/package/vanic)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/vanic.svg)](https://npmjs.org/package/vanic)
[![gzip](https://img.badgesize.io/https:/unpkg.com/vanic/index.min.js?label=gzip&compression=gzip)](https://github.com/herudi/vanic)

## Features

- Small.
- Reactive-UI.
- Hooks.
- More.

## Examples
- [Counter](https://codesandbox.io/s/vanic-counter-9oc5r9?file=/src/index.jsx)
- [Todo App](https://codesandbox.io/s/vanic-todo-app-7e84xy?file=/src/index.jsx)
- [With Router](https://codesandbox.io/s/vanic-with-router-j10svs?file=/src/index.jsx)

## Html-Attribute First
In vanic, component or event and more will convert to `html-attribute`.

## Install

### NPM or Yarn

```bash
npm i vanic
// or
yarn add vanic
```

### Deno

```ts
import {...} from "https://deno.land/x/vanic@0.0.23/mod.ts";

// more code
```
### Usage

```jsx
/** @jsx h */
import { h, render, useEffect, useState } from "vanic";

const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // log counter
    console.log(count);
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <h2>{count}</h2>
    </div>
  );
};

render(Counter, document.getElementById("app"));
// or
// render(<Counter/>, document.getElementById("app"));
```

### Server Side

```jsx
/** @jsx h */
import { h, renderToString } from "vanic";

const Home = () => {
  return <h1>Hello Home</h1>;
};

const str = renderToString(<Home/>);
console.log(str);
// send str to server.
```

## Hooks

### UseState

```js
const [state, setState] = useState(0);
// or
const [state, setState, getState] = useState(0);
```
> note: getState for live state.

### UseEffect & UseLayoutEffect

```js
useEffect(() => {
  // code
  return () => {
    // cleanup
  };
}, [/* deps */]);
```

### UseReducer

```js
const [state, dispatch] = useReducer(reducer, initial, /* initLazy */);
```

### UseMemo

```js
const value = useMemo(() => expensiveFunc(a, b), [a, b]);
```

### UseCallback

```js
const addTodo = useCallback(() => {
  setTodos((prev) => [...prev, "New Todo"]);
}, [todos]);
```

### UseRef

```js
const count = useRef(0);
```

> Note: `useRef` for access DOM different from react.

Accesing DOM via useRef

```js
const Home = () => {
  const input = useRef(null);

  return (
    <div>
      <input ref={input} />
      <button onClick={() => input.ref().focus()}>Focus Me</button>
    </div>
  );
};
```

### UseContext & CreateContext

```js
const ThemeContext = createContext();

const Home = () => {
  const theme = useContext(ThemeContext);

  return <h1 style={{ color: theme.color }}>Hello Home</h1>;
};

const App = () => {
  return (
    <ThemeContext.Provider value={{ color: 'red' }}>
      <Home/>
    </ThemeContext.Provider>
  )
};

render(App, document.getElementById("app"));
```

### Custom Hook

Very simple with custom hook.

Example handling input.

```jsx
/** @jsx h */
import { h, render, useState } from "vanic";

// example hook for handling input form.
const useInput = (initState) => {
  const [input, handle] = useState(initState);
  return [
    // object input
    input,

    // handling
    (e) =>
      handle({
        ...input,
        [e.target.id]: e.target.value,
      }),

    // reset
    (obj = {}) => handle({ ...input, ...obj }),
  ];
};

const MyForm = () => {
  const [input, handleInput, resetInput] = useInput({
    name: "",
    address: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(input);
    // => { name: "foo", address: "bar" }

    // reset
    resetInput({ name: "", address: "" });
  };

  return (
    <form onSubmit={onSubmit}>
      <input id="name" value={input.name} onChange={handleInput} />
      <input id="address" value={input.address} onChange={handleInput} />
      <button type="submit">Submit</button>
    </form>
  );
};

render(MyForm, document.getElementById("app"));
```

## Style

Support style as object.

```js
...
<h1 style={{ color: 'red' }}>hello</h1>
...
```
## Fragment

```jsx
/** @jsx h */
import { h, render, Fragment } from "vanic";

const App = () => {
  return (
    <Fragment>
      <h1>Hello</h1>
    </Fragment>
  )
}

render(App, document.getElementById("app"));
```
