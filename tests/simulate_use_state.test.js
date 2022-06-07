import test from 'ava';
import createApp from './_create_app.js';
import { render, html, useState } from '../src/index.js';

test('simulate useState.', (t) => {
  const app = createApp()
  const Home = () => {
    const [count, setCount] = useState(0)
    const click = () => setCount(count + 1)
    return html`<button onclick="${click}">btn</button>
<h1>${count}</h1>`
  }
  render(Home, document.getElementById('app'))
  const btn = document.querySelector('[c-f="0"]')
  btn.click()
  t.is(app.innerHTML, `<button c-f="0">btn</button>
<h1>1</h1>`)
})