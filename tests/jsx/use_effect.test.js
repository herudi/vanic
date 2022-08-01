/* @jsx h */
const { h, render, useState, useEffect } = require("../../npm/index.js");
const test = require("ava");
const createApp = require("../_create_app.js");

createApp();
const spy = { count: 0, clean: 'no' };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Hello = () => {
  const [count, setCount] = useState(0);

  const click = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    spy.count = count;
    return () => {
      spy.clean = 'yes';
    }
  }, [count]);

  return (
    <div>
      <button onClick={click}>click</button>
      <h1>{count}</h1>
    </div>
  )
}

test('useEffect', async t => {
  render(<Hello />, document.getElementById('app'));
  const btn = document.querySelector('button');
  btn.click();
  btn.click();
  await sleep(1000);
  t.is(spy.count, 2);
  t.is(spy.clean, 'yes');
});