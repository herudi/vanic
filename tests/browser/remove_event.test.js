const test = require('ava');
const { render, html } = require('./../../npm/index.cjs.js')

test('render removing all event', t => {
  const Home = () => {
    const click = () => {
      console.log('click')
    }
    return html`<button onclick="${click}">Click Me !</button>`
  }
  const str = render(Home)
  t.is(str, '<button>Click Me !</button>')
})