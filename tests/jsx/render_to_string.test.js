/* @jsx h */
const {h, renderToString} = require("../../npm/index.js");
const test = require("ava");

const Hello = () => <h1>hello</h1>;

test('render', t => {
	const str = renderToString(<Hello/>)
  t.is(str, '<h1>hello</h1>')
});