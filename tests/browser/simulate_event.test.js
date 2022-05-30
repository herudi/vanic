const test = require('ava');
const createApp = require('../_create_app.js');
const { render, html } = require('./../../npm/index.node.js')

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
  const btn = document.querySelector('[_vf="0"]')
  btn.click()
  t.is(spy.click, true)
})