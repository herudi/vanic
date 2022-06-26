import test from 'ava';
import { renderToString, html, comp } from '../../src/esm.js';

test('render removing all event', t => {
  const Home = comp(() => {
    const click = () => {
      console.log('click')
    }
    return html`<button onclick="${click}">Click Me !</button>`
  })
  const str = renderToString(Home)
  t.is(str, '<button>Click Me !</button>')
})