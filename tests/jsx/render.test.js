/* @jsx h */
const test = require('ava');
const { renderToString, h } = require('./../../npm/index.cjs.js')

test('render return as string', t => {
  const Home = () => {
    return <h1>Hello Vanic</h1>
  }
  const str = renderToString(Home)
  t.is(str, '<h1>Hello Vanic</h1>')
})