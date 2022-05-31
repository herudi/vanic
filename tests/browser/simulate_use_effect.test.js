const test = require('ava');
const createApp = require('../_create_app.js');
const { render, html, useEffect, useState } = require('./../../npm/index.cjs.js')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test('simulate useEffect.', async (t) => {
  const app = createApp()
  const Home = () => {
    const [count, setCount] = useState(0)
    const [clean, setClean] = useState('No Clean')
    const [effectCount, setEffectCount] = useState(count)
    const [effectCountDeps, setEffectCountDeps] = useState(count)
    const [effectCountNoDeps, setEffectCountNoDeps] = useState(count)

    useEffect(() => {
      setEffectCountNoDeps(count)
    }, [])

    useEffect(() => {
      setEffectCount(count)
    })

    useEffect(() => {
      let status = false
      setTimeout(() => {
        if (status) {
          setClean('Is Clean')
        }
      }, 1000)
      setEffectCountDeps(count)
      return () => {
        status = true
      }
    }, [count])

    const click = () => {
      setCount(count + 1)
    }
    return html`<button onclick="${click}">Click Me !</button>
<h1>${effectCountNoDeps} ${effectCount} ${effectCountDeps} ${clean}</h1>`
  }
  render(Home, document.getElementById('app'))
  await sleep(3000)
  const btn = document.querySelector('[_vf="0"]')
  btn.click()
  await sleep(1000)
  t.is(app.innerHTML, `<button _vf="0">Click Me !</button>
<h1>0 1 1 Is Clean</h1>`)
})