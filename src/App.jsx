import './App.css';
import TodoList from './features/TodoList/TodoList';
import TodoForm from './features/TodoForm';
import { useState } from 'react';

function App() {
  const [todoList, setTodoList] = useState([]);


  function handleAddTodo(title) {
    const newTodo = {
      id: Date.now(),
      title: title,
      isCompleted: false,
    };
    setTodoList([...todoList, newTodo]);
  }

  function completeTodo(id) {
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isCompleted: true };
      } else {
        return todo;

      }
      
    });
    setTodoList(updatedTodos);
  }

  function updateTodo(editedTodo) {
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === editedTodo.id) {
        return { ...editedTodo };
      } else {
        return todo;

      }
      
    });
    setTodoList(updatedTodos);
  }

  return (
    
      <div>
        <h1>My todos</h1>
        <TodoForm onAddTodo={handleAddTodo} />
        <TodoList todoList={todoList} onCompleteTodo={completeTodo} onUpdateTodo={updateTodo}></TodoList>
      </div>
    
  );
}

export default App;
