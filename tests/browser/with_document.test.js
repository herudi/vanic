const test = require('ava');
const createApp = require('../_create_app.js');
const { render, html } = require('./../../npm/index.cjs.js')

test('render with document and add event onclick', t => {
  const app = createApp()
  const Home = () => {
    const click = () => {
      console.log('click')
    }
    return html`<button onclick="${click}">Click Me !</button>`
  }
  render(Home, document.getElementById('app'))
  t.is(app.innerHTML, '<button _vf="0">Click Me !</button>')
})