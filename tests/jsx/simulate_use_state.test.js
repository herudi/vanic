/* @jsx h */
const test = require('ava');
const createApp = require('../_create_app.js');
const { render, h, useState, Fragment } = require('./../../npm/index.node.js')

test('simulate useState.', (t) => {
  const app = createApp()
  const Home = () => {
    const [count, setCount] = useState(0)
    const click = () => setCount(count + 1)
    return (
      <Fragment>
        <button onclick={click}>btn</button>
        <h1>{count}</h1>
      </Fragment>
    )
  }
  render(Home, document.getElementById('app'))
  const btn = document.querySelector('[_vf="0"]')
  btn.click()
  t.is(app.innerHTML, `<button _vf="0">btn</button><h1>1</h1>`)
})