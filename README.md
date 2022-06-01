## Vanic
A small ~1kb, Hook-based library for creating Reactive-UI in Vanilla.

[![ci](https://github.com/herudi/vanic/workflows/ci/badge.svg)](https://github.com/herudi/vanic)
[![npm version](https://img.shields.io/badge/npm-0.0.8-blue.svg)](https://npmjs.org/package/vanic)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/vanic.svg)](https://npmjs.org/package/vanic)

## Features
- Reactive-UI.
- Hook-based. `useState` and `useEffect` in vanilla.
- jsx support.

> For syntax highlight, just install vscode extensions for literal html [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html).


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
    // code
  </script>
</body>
```
## Usage

### Template Literal
```js
import { html, render, useState } from "vanic";

const Counter = () => {
  const [count, setCount] = useState(0);

  return html`
    <button onclick="${() => setCount(count + 1)}">Click Me</button>
    <h2>${count}</h2>
  `
}

render(Counter, document.getElementById("app"));
```
### Jsx
```jsx
/* @jsx h */
import { h, render, useState, Fragment } from "vanic";

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <Fragment>
      <button onclick={() => setCount(count + 1)}>Click Me</button>
      <h2>{count}</h2>
    </Fragment>
  )
}

render(Counter, document.getElementById("app"));
```
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

      const Counter = () => {
        const [count, setCount] = useState(0);

        return html`
          <button onclick="${() => setCount(count + 1)}">Click Me</button>
          <h2>${count}</h2>
        `
      }

      render(Counter, document.getElementById("app"));
    </script>
  </body>
</html>
```
### Server Side
```js
/* @jsx h */
import { h, renderToString, useState, Fragment } from "vanic";

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <Fragment>
      <button onclick={() => setCount(count + 1)}>Click Me</button>
      <h2>{count}</h2>
    </Fragment>
  )
}

const str = renderToString(Counter);
console.log(str);
// send in the server.
```
## Hooks
### UseState
This hooks inspired `React.useState`.

```js
const [state, setState] = useState(0);
```
### UseEffect
This hooks inspired `React.useEffect`.
```js
useEffect(() => {
  // code
  return () => {
    // cleanup
  }
}, [/* deps */]);
```

### Custom Hook
Very simple with custom hook.

Example handling input.
```js
import { html, render, useState } from "vanic";

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

  return html`
    <form onsubmit="${onSubmit}">
      <input id="name" value="${input.name}" onchange="${handleInput}" />
      <input id="address" value="${input.address}" onchange="${handleInput}" />
      <button type="submit">Submit</button>
    </form>
  `
}

render(MyForm, document.getElementById("app"));
```
## Style
Support style with object.
```js
...
<div style="${{ backgroundColor: 'red' }}">/* more */</div>
...
```