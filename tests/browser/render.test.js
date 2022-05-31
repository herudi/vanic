const test = require('ava');
const { render, html } = require('./../../npm/index.cjs.js')

test('render return as string', t => {
  const Home = () => {
    return html`<h1>Hello Vanic</h1>`
  }
  const str = render(Home)
  t.is(str, '<h1>Hello Vanic</h1>')
})