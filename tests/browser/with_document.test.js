const test = require('ava');
const createApp = require('../_create_app.js');
const { render, html } = require('./../../npm/index.js')

test('render with document and add event onclick', t => {
  const app = createApp()
  const Home = () => {
    const click = () => {
      console.log('click')
    }
    return html`<button onclick="${click}">Click Me !</button>`
  }
  render(Home, document.getElementById('app'))
  t.is(app.innerHTML, '<button c-f="0">Click Me !</button>')
})