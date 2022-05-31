const test = require('ava');
const { renderToString, html } = require('./../../npm/index.cjs.js')

test('render return as string', t => {
  const Home = () => {
    return html`<h1>Hello Vanic</h1>`
  }
  const str = renderToString(Home)
  t.is(str, '<h1>Hello Vanic</h1>')
})