import './App.css';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import { useState } from 'react';

function App() {
  const [newTodo, setNewTodo] = useState("to");

  return (
    <>
      <div>
        
      <h1>My todos</h1>
      <TodoForm setNewTodo={setNewTodo}/>
      <p>{newTodo}</p>
      <TodoList></TodoList>
      
      
      </div>
      
    </>
  )
}

export default App;
