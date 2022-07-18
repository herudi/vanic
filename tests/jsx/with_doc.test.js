/* @jsx h */
const { h, render } = require("../../npm/index.js");
const test = require("ava");
const createApp = require("../_create_app.js");

const app = createApp();

const Hello = () => <h1>hello</h1>;

test('render', t => {
  render(<Hello/>, document.getElementById('app'));
  t.is(app.innerHTML, '<h1 c-comp="0-hello">hello</h1>');
});