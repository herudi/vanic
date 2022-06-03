## Vanic
A small, Hook-based library for creating Reactive-UI in Vanilla.

[![ci](https://github.com/herudi/vanic/workflows/ci/badge.svg)](https://github.com/herudi/vanic)
[![npm version](https://img.shields.io/badge/npm-0.0.12-blue.svg)](https://npmjs.org/package/vanic)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/vanic.svg)](https://npmjs.org/package/vanic)
[![gzip](https://img.badgesize.io/https:/unpkg.com/vanic/index.min.js?label=gzip&compression=gzip)](https://github.com/herudi/vanic)

## Features
- Reactive-UI.
- Hook-based in vanilla.
- No compiler and build-tool required.

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
import { html, render, useState } from "https://deno.land/x/vanic@0.0.12/mod.ts";

// more code
```
## Usage

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
```js
import { html, renderToString, useState } from "vanic";

const Counter = () => {
  const [count, setCount] = useState(0);

  return html`
    <div>
      <button onclick="${() => setCount(count + 1)}">Click Me</button>
      <h2>${count}</h2>
    </div>
  `;
}

const str = renderToString(Counter);
console.log(str);
// send in the server.
```
### Passing Props
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
### More Hooks
For more hooks you can find in `examples/hooks`. just copy to your stack.

## Style
Support style with object.
```js
...
<div style="${{ backgroundColor: 'red' }}">/* more */</div>
...
```