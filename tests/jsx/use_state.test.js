/* @jsx h */
const { h, render, useState } = require("../../npm/index.js");
const test = require("ava");
const createApp = require("../_create_app.js");

createApp();
const spy = { count: 0 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Hello = () => {
  const [count, setCount] = useState(0);
  const click = () => {
    const newCount = count + 1;
    setCount(newCount);
    spy.count = newCount;
  };

  return (
    <div>
      <button onClick={click}>click</button>
      <h1>{count}</h1>
    </div>
  )
}

test('useState', async t => {
  render(<Hello />, document.getElementById('app'));
  const btn = document.querySelector('button');
  btn.click();
  await sleep(1000);
  t.is(spy.count, 1);
});