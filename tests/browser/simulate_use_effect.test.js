import test from 'ava';
import createApp from '../_create_app.js';
import { render, html, useEffect, useState, comp } from '../../src/esm.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test('simulate useEffect.', async (t) => {
  const app = createApp()
  let status = false
  const Home = comp(() => {
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
    }, [count])

    useEffect(() => {
      if (status) {
        setClean('Is Clean')
      }
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
  })
  render(Home, document.getElementById('app'))
  await sleep(1000)
  const btn = document.querySelector('[c-onclick="0"]')
  btn.click()
  await sleep(1000)
  t.is(app.innerHTML, `<button c-onclick="0" c-comp="0">Click Me !</button>
<h1>0 1 1 Is Clean</h1>`)
})