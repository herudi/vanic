/* @jsx h */
const test = require('ava');
const { renderToString, h } = require('./../../npm/index.cjs.js')

test('render removing all event', t => {
  const Home = () => {
    const click = () => {
      console.log('click')
    }
    return <button onclick={click}>Click Me !</button>
  }
  const str = renderToString(Home)
  t.is(str, '<button>Click Me !</button>')
})