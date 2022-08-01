/* @jsx h */

import { h, render, useState, Fragment } from "./../../src/index";

const Item = ({ name, onDelete }) => {
  return (
    <div>
      <span style={{ marginRight: 20 }}>{name}</span>
      <button onclick={onDelete}>x</button>
    </div>
  );
};

const List = ({ todos, onDelete }) => {
  return (
    <div>
      {todos.map((el) => {
        return <Item name={el.name} onDelete={() => onDelete(el.key)} />;
      })}
    </div>
  );
};

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState('');
  const [disable, setDisable] = useState(true);

  const addTodo = (e) => {
    e.preventDefault();
    setTodos([
      ...todos,
      {
        name: todoText,
        key: Date.now().toString(),
      },
    ]);
    setTodoText('');
  };

  const onDelete = (key) => {
    const arr = todos.filter((el) => el.key !== key);
    setTodos(arr);
  };

  return (
    <Fragment>
      <h1>Todo</h1>
      <form onsubmit={addTodo}>
        <input
          value={todoText}
          onchange={(e) => setTodoText(e.target.value)}
          placeholder="Enter todo"
        />
        <button type="submit">Add</button>
      </form>
      <List todos={todos} onDelete={onDelete} />
    </Fragment>
  );
};

render(<Todo/>, document.getElementById("app"));