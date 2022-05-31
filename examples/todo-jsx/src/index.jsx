/* @jsx h */
import { h, render, Fragment, useState } from "vanic";
import { List } from './list';

function App() {
  const [items, setItems] = useState([]);
  const [itemText, setItemText] = useState("");
  const addItems = (e) => {
    e.preventDefault();
    setItems([...items, {
      key: Date.now().toString(),
      name: itemText
    }]);
    setItemText("");
  }
  const deleteItems = (key) => {
    const newItems = items.filter(el => el.key !== key);
    setItems(newItems);
  }
  return (
    <Fragment>
      <h1>Todo List App</h1>
      <form onSubmit={addItems}>
        <input value={itemText} onChange={(e) => setItemText(e.target.value)} placeholder="Todo enter"/>
        <button onClick={addItems} type="submit">Add</button>
      </form>
      {items.length !== 0 && <List items={items} onDelete={deleteItems}/>}
    </Fragment>
  )
}

render(App, document.getElementById("app"));