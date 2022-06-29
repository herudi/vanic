import test from 'ava';
import createApp from '../_create_app.js';
import { render, html, comp } from '../../src/esm.js';

test('render with document and add event onclick', t => {
  const app = createApp()
  const Home = comp(() => {
    const click = () => {
      console.log('click')
    }
    return html`<button onclick="${click}">Click Me !</button>`
  })
  render(Home, document.getElementById('app'))
  t.is(app.innerHTML, '<button c-onclick="0" c-comp="0">Click Me !</button>')
})