/* @jsx h */
const test = require('ava');
const { render, h } = require('./../../npm/index.node.js')

test('render return as string', t => {
  const Home = () => {
    return <h1>Hello Vanic</h1>
  }
  const str = render(Home)
  t.is(str, '<h1>Hello Vanic</h1>')
})