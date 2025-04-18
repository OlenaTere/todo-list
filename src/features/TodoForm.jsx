import { useRef } from 'react';
import { useState } from 'react';

export default function TodoForm({ onAddTodo }) {
  const todoTitleInput = useRef('');
  const [workingTodo, setWorkingTodo] = useState('');

  function handleAddTodo(event) {
    event.preventDefault();
    //const title = event.target.title.value;
    onAddTodo(workingTodo);
    setWorkingTodo('');
    //event.target.title.value = '';
    todoTitleInput.current.focus();
  }

  return (
    <form onSubmit={handleAddTodo}>
      <label htmlFor="todoTitle">Todo</label>
      <input
        type="text"
        name="title"
        id="todoTitle"
        value={workingTodo}
        ref={todoTitleInput}
        onChange={(e) => setWorkingTodo(e.target.value)}
      ></input>
      <button type="submit" disabled={workingTodo === ''}>
        Add Todo
      </button>
    </form>
  );
}
