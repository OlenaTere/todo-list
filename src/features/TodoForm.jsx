import { useRef } from 'react';
import { useState } from 'react';
import TextInputWithLabel from '../shared/TextInputWithLabel';

export default function TodoForm({ onAddTodo }) {
  const todoTitleInput = useRef('');
  const [workingTodo, setWorkingTodo] = useState('');

  function handleAddTodo(event) {
    event.preventDefault();
    //const title = event.target.title.value;
    onAddTodo({
      title: workingTodo,
      isCompleted: false,
    });
    setWorkingTodo('');
    //event.target.title.value = '';
    todoTitleInput.current.focus();
  }

  return (
    <form onSubmit={handleAddTodo}>
      <TextInputWithLabel
        value={workingTodo}
        ref={todoTitleInput}
        onChange={(e) => setWorkingTodo(e.target.value)}
        elementId="todoTitle"
        labelText="Todo"
      ></TextInputWithLabel>
      <button type="submit" disabled={workingTodo === ''}>
        Add Todo
      </button>
    </form>
  );
}
