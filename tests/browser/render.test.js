import test from 'ava';
import { renderToString, html } from '../../src/esm.js';

test('render return as string', t => {
  const Home = () => {
    return html`<h1>Hello Vanic</h1>`
  }
  const str = renderToString(Home)
  t.is(str, '<h1>Hello Vanic</h1>')
})