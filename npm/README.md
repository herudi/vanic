## Vanic
A small ~1kb, Hook-based library for creating Reactive-UI in Vanilla.

[![ci](https://github.com/herudi/vanic/workflows/ci/badge.svg)](https://github.com/herudi/vanic)
[![npm version](https://img.shields.io/badge/npm-0.0.4-blue.svg)](https://npmjs.org/package/vanic)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/vanic.svg)](https://npmjs.org/package/vanic)
[![minzip](https://img.shields.io/bundlephobia/minzip/vanic)](https://github.com/herudi/vanic)

## Features
- Reactive-UI.
- Hook-based. `useState` and `useEffect` in vanilla.
- jsx support.

> For syntax highlight, just install vscode extensions for literal html [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html).

## Usage
### Browser
```html
<html>
<head>
  <script src="//unpkg.com/vanic"></script>
</head>
<body>

  <!-- target id -->
  <div id="app"></div>

  <!-- script -->
  <script>
    const { html, render } = Vanic;

    const Button = props => {
      const myClick = (e) => {
        console.log("Hello Vanic");
      }
      return html`
        <button onclick="${myClick}">${props.text}</button>
      `;
    }

    const App = () => {
      return html`
        <div>
          <h1>Hello Vanic</h1>
          ${Button({ text: "Click Me" })}
        </div>
      `
    }

    const str = render(App, document.getElementById("app"));

    console.log(str);
    // <div>
    //   <h1>Hello Vanic</h1>
    //   <button>Click Me</button>
    // </div>
  </script>
</body>
</html>
```
### ES Module
```html
<script type="module">
  import { html, render } from "https://esm.sh/vanic";
  // code here
</script>
```
### Nodejs
```bash
npm i vanic
// or
yarn add vanic
```
```js
// commonjs
const {...} = require("vanic");

// esm
import {...} from "vanic";
```

## Hooks
### UseState
This hooks inspired `React.useState`.

Example counter app
```js
import { html, render, useState } from "vanic";

const Counter = () => {
  const [count, setCount] = useState(0);

  return html`
    <div>
      <h1>Counter App</h1>
      <button onclick="${() => setCount(count + 1)}">+</button>
      <button onclick="${() => setCount(count - 1)}">-</button>
      <h2>${count}</h2>
    </div>
  `
}

render(Counter, document.getElementById("app"));
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
```js
import { html, render, useState, useEffect } from "vanic";

const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(count);
  })

  return html`
    <div>
      <h1>Counter App</h1>
      <button onclick="${() => setCount(count + 1)}">+</button>
      <button onclick="${() => setCount(count - 1)}">-</button>
      <h2>${count}</h2>
    </div>
  `
}

render(Counter, document.getElementById("app"));
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
## Jsx Support
```js
/* @jsx h */
import { h, render, useState, Fragment } from "vanic";

function Home() {
  return (
    <Fragment>
      <h1>Hello Home</h1>
      <h2>Hello Jsx</h2>
    </Fragment>
  )
};

render(Home, document.getElementById("app"));

// <h1>Hello Home</h1><h2>Hello Jsx</h2>
```