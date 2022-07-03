## Vanic

A small, Hook-based library for creating Reactive-UI in Vanilla.

Vanic is an `html-attribute` first.

[![ci](https://github.com/herudi/vanic/workflows/ci/badge.svg)](https://github.com/herudi/vanic)
[![npm version](https://img.shields.io/badge/npm-0.0.22-blue.svg)](https://npmjs.org/package/vanic)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/vanic.svg)](https://npmjs.org/package/vanic)
[![gzip](https://img.badgesize.io/https:/unpkg.com/vanic/index.min.js?label=gzip&compression=gzip)](https://github.com/herudi/vanic)

## Features

- Reactive-UI.
- Hooks.
- Jsx & literals HTML.

## Examples
- [Counter](https://codesandbox.io/s/vanic-counter-9oc5r9?file=/src/index.jsx)
- [Todo App](https://codesandbox.io/s/vanic-todo-app-7e84xy?file=/src/index.jsx)
- [With Router](https://codesandbox.io/s/vanic-with-router-j10svs?file=/src/index.jsx)

## Html-Attribute First
In vanic, component or event and more will convert to `html-attribute`.

```jsx

// component 1
const Title = comp(({ children }) => <h1>{children}</h1>);

// parent component
const App = comp(() => {
  return (
    <div>
      <h1>Hello Vanic</h1>
      <Title>Hello Title</Title>
      <button onClick={() => console.log('hello')}>Click Me</button>
    </div>
  )
});

render(App, document.getElementById("app"));

Output is :
// parent
<div c-comp="2">
  <h1>Hello Vanic</h1>

  // component 1
  <h1 c-comp="1">Hello Title</h1>

  // event onclick
  <button c-onclick="0">Click Me</button>
</div>

Will be remove if ssr :
const str = renderToString(App);
// send str on the server-side

After render :
<div>
  <h1>Hello Vanic</h1>
  <h1>Hello Title</h1>
  <button>Click Me</button>
</div>
```

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
import {...} from "https://deno.land/x/vanic@0.0.22/mod.ts";

// more code
```

## Usage

```js
import { comp, html, render, useEffect, useState } from "vanic";

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
});

render(Counter, document.getElementById("app"));
```

> For syntax highlight, just install vscode extensions for literal html
> [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html).

### Usage Jsx

```jsx
/** @jsx h */
import { comp, h, render, useEffect, useState } from "vanic";

// create component button
const Button = comp((props) => <button {...props}>{props.children}</button>);

const Counter = comp(() => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // log counter
    console.log(count);
  }, [count]);

  return (
    <div>
      <Button onClick={() => setCount(count + 1)} style={{ color: "red" }}>Click Me</Button>
      <h2>{count}</h2>
    </div>
  );
});

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
      const {html, render, useState} = Vanic; //more code here
    </script>
  </body>
</html>;
```

### Server Side

```jsx
/** @jsx h */
import { comp, h, renderToString, useState } from "vanic";

const Home = comp(() => {
  return <h1>Hello Home</h1>;
});

const str = renderToString(Home);
console.log(str);
// send in the server.
```

### Passing props in literals

```js
import { comp, html, render } from "vanic";

const Title = comp((props) => html`<h1>${props.text}</h1>`);

const Home = comp(() => {
  return html`
    <div>
      ${Title({ text: "My Title" })}
      <h2>Welcome</h2>
    </div>
  `;
});

render(Home, document.getElementById("app"));
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
const [state, dispatch] = useReducer(reducer, initial/* initLazy */
);
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
      <input ref={input} />
      <button
        onClick={() => {
          input.ref().focus();
        }}
      >
        Focus Me
      </button>
    </Fragment>
  );
});
```

### UseContext

> Note: `UseContext` different from react.

```js
const ThemeContext = createContext();

const Home = comp(() => {
  const theme = useContext(ThemeContext);

  return <h1 style={{ color: theme.color }}>Hello Home</h1>;
});

const App = comp(() => {
  return ThemeContext.Provider({ color: "red" }, () => {
    return <Home />;
  });
});

render(App, document.getElementById("app"));
```

### Custom Hook

Very simple with custom hook.

Example handling input.

```jsx
/** @jsx h */
import { comp, h, render, useState } from "vanic";

// example hook for handling input form.
const useInput = comp((initState) => {
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
});

const MyForm = comp(() => {
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
});

render(MyForm, document.getElementById("app"));
```

## Style

Support style with object.

```js
...
<div style={{ backgroundColor: 'red' }}>/* more */</div>
...
```
