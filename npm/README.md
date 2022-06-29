## Vanic
A small, Hook-based library for creating Reactive-UI in Vanilla.

[![ci](https://github.com/herudi/vanic/workflows/ci/badge.svg)](https://github.com/herudi/vanic)
[![npm version](https://img.shields.io/badge/npm-0.0.19-blue.svg)](https://npmjs.org/package/vanic)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/vanic.svg)](https://npmjs.org/package/vanic)
[![gzip](https://img.badgesize.io/https:/unpkg.com/vanic/index.min.js?label=gzip&compression=gzip)](https://github.com/herudi/vanic)

## Features
- Reactive-UI.
- Hooks.
- Jsx & literals HTML.

## Install
### NPM or Yarn
```bash
npm i vanic
// or
yarn add vanic
```
### Browser
```html
<!-- place in the head -->
<head>
  <script src="//unpkg.com/vanic"></script>
</head>
```
### ES Module
```html
<body>
  ...
  <script type="module">
    import {...} from "https://esm.sh/vanic";
    
    // more code
  </script>
</body>
```
### Deno
```ts
import {...} from "https://deno.land/x/vanic@0.0.19/mod.ts";

// more code
```
## Usage
### Jsx
```jsx
/** @jsx h */
import { h, comp, Fragment, render, useState, useEffect } from "vanic";

const Counter = comp(() => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // log counter
    console.log(count);
  }, [count]);

  return (
    <Fragment>
      <button onClick={() => setCount(count + 1)}>Click Me</button>
      <h2>{count}</h2>
    </Fragment>
  )
})

render(Counter, document.getElementById("app"));
```
### Literals Html

```js
import { html, render, useState, useEffect, comp } from "vanic";

const Counter = comp(() => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // log counter
    console.log(count);
  }, [count]);

  return html`
    <div>
      <button onclick="${() => setCount(count + 1)}">Click Me</button>
      <h2>${count}</h2>
    </div>
  `;
})

render(Counter, document.getElementById("app"));
```
> For syntax highlight, just install vscode extensions for literal html [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html).

### Usage in browser
```js
<html>
  <head>
    <script src="//unpkg.com/vanic"></script>
  </head>
  <body>
    <div id="app"></div>
    <script>
      const { html, render, useState } = Vanic;
      //more code here
    </script>
  </body>
</html>
```
### Server Side
```jsx
/** @jsx h */
import { h, renderToString, useState, comp } from "vanic";

const Home = comp(() => {
  return <h1>Hello Home</h1>
})

const str = renderToString(Home);
console.log(str);
// send in the server.
```
### Passing props in literals
```js
import { html, render, comp } from "vanic";

const Title = comp(props => html`<h1>${props.text}</h1>`);

const Home = comp(() => {

  return html`
    <div>
      ${Title({ text: "My Title" })}
      <h2>Welcome</h2>
    </div>
  `;
})

render(Home, document.getElementById("app"));
```
## Hooks
### UseState
```js
const [state, setState] = useState(0);
```
### UseEffect & UseLayoutEffect
```js
useEffect(() => {
  // code
  return () => {
    // cleanup
  }
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
const Home = comp(() => {
  const input = useRef(null);

  return (
    <Fragment>
      <input ref={input}/>
      <button onClick={() => {
        input.ref().focus();
      }}>Focus Me</button>
    </Fragment>
  )
})
```
### UseContext
> Note: `UseContext` different from react.
```js

const ThemeContext = createContext();

const Home = comp(() => {
  const theme = useContext(ThemeContext);

  return <h1 style={{ color: theme.color }}>Hello Home</h1>
});

const App = comp(() => {
  return ThemeContext.Provider({ color: "red" }, () => {
    return <Home/>
  });
})

render(App, document.getElementById("app"));
```
### Custom Hook
Very simple with custom hook.

Example handling input.
```jsx
/** @jsx h */
import { h, render, useState, comp } from "vanic";

// example hook for handling input form.
const useInput = comp((initState) => {
  const [input, handle] = useState(initState);
  return [
    // object input
    input,

    // handling
    (e) => handle({ 
      ...input, 
      [e.target.id]: e.target.value 
    }),

    // reset
    (obj = {}) => handle({ ...input, ...obj })
  ]
})

const MyForm = comp(() => {
  const [input, handleInput, resetInput] = useInput({
    name: "",
    address: ""
  });

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(input);
    // => { name: "foo", address: "bar" }

    // reset
    resetInput({ name: "", address: "" })
  }

  return (
    <form onSubmit={onSubmit}>
      <input id="name" value={input.name} onChange={handleInput} />
      <input id="address" value={input.address} onChange={handleInput} />
      <button type="submit">Submit</button>
    </form>
  )
})

render(MyForm, document.getElementById("app"));
```
## Style
Support style with object.
```js
...
<div style={{ backgroundColor: 'red' }}>/* more */</div>
...
```