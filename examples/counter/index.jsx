/* @jsx h */

import { h, render, useState, useEffect } from "./../../src/index";

const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(count);
  }, [count]);

  return (
    <div>
      <button onclick={() => setCount(count + 1)}>Increment</button>
      <button onclick={() => setCount(count - 1)}>Decrement</button>
      <h1>{count}</h1>
    </div>
  )
}

render(<Counter/>, document.getElementById("app"));