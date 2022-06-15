import test from 'ava';
import createApp from '../_create_app.js';
import { render, html } from '../../src/esm.js';

test('render with document and add event onclick', t => {
  const app = createApp()
  const Home = () => {
    const click = () => {
      console.log('click')
    }
    return html`<button onclick="${click}">Click Me !</button>`
  }
  render(Home, document.getElementById('app'))
  t.is(app.innerHTML, '<button c-0="0">Click Me !</button>')
})