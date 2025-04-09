import './App.css';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import { useState } from 'react';

function App() {
  const [todoList, setTodoList] = useState([]);
  
  function handleAddTodo (newTodo) {
    setTodoList([...todoList, newTodo]);
  }


  return (
    <>
      <div>
      <h1>My todos</h1>
      <TodoForm onAddTodo={handleAddTodo}/>
      <TodoList todoList={todoList}></TodoList>
      </div>
      
    </>
  )
}

export default App;
