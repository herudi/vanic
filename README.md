## Vanic
A small, Hook-based library for creating Reactive-UI in Vanilla.

[![ci](https://github.com/herudi/vanic/workflows/ci/badge.svg)](https://github.com/herudi/vanic)
[![npm version](https://img.shields.io/badge/npm-0.0.14-blue.svg)](https://npmjs.org/package/vanic)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/vanic.svg)](https://npmjs.org/package/vanic)
[![gzip](https://img.badgesize.io/https:/unpkg.com/vanic/index.min.js?label=gzip&compression=gzip)](https://github.com/herudi/vanic)

## Features
- Reactive-UI.
- Hooks.
- No compiler and build-tool required.
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
    import { html, render } from "https://esm.sh/vanic";
    
    // more code
  </script>
</body>
```
### Deno
```ts
/** @jsx h */
import { h, render, useState } from "https://deno.land/x/vanic@0.0.14/mod.ts";

// more code
```
## Usage
### Jsx
> Note: jsx requires build-tools.
```jsx
/** @jsx h */
import { h, Fragment, render, useState, useEffect } from "vanic";

const Counter = () => {
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
}

render(Counter, document.getElementById("app"));
```
### Literals Html

```js
import { html, render, useState, useEffect } from "vanic";

const Counter = () => {
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
}

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
import { h, renderToString, useState } from "vanic";

const Home = () => {
  return <h1>Hello Home</h1>
}

const str = renderToString(Home);
console.log(str);
// send in the server.
```
### Passing props in literals
```js
import { html, render } from "vanic";

const Title = props => html`<h1>${props.text}</h1>`;

const Home = () => {

  return html`
    <div>
      ${Title({ text: "My Title" })}
      <h2>Welcome</h2>
    </div>
  `;
}

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
const Home = () => {
  const input = useRef(null);

  return (
    <Fragment>
      <input ref={input}/>
      <button onClick={() => {
        input.ref().focus();
      }}>Focus Me</button>
    </Fragment>
  )
}
```
### UseContext
> Note: `UseContext` different from react.
```js

const ThemeContext = createContext();

const Home = () => {
  const theme = useContext(ThemeContext);

  return <h1 style={{ color: theme.color }}>Hello Home</h1>
};

const App = () => {
  return ThemeContext.Provider({ color: "red" }, () => {
    return <Home/>
  });
}

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
    (e) => handle({ 
      ...input, 
      [e.target.id]: e.target.value 
    }),

    // reset
    (obj = {}) => handle({ ...input, ...obj })
  ]
}

const MyForm = () => {
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
}

render(MyForm, document.getElementById("app"));
```
## Style
Support style with object.
```js
...
<div style={{ backgroundColor: 'red' }}>/* more */</div>
...
```