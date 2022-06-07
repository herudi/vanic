import test from 'ava';
import createApp from './_create_app.js';
import { render, html } from '../src/index.js';

test('simulate click event.', (t) => {
  createApp()
  const spy = {}
  const Home = () => {
    const click = () => {
      spy.click = true
    }
    return html`<button onclick="${click}">Click Me !</button>`
  }
  render(Home, document.getElementById('app'))
  const btn = document.querySelector('[c-f="0"]')
  btn.click()
  t.is(spy.click, true)
})