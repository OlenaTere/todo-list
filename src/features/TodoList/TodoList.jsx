import TodoListItem from './TodoListItem';
import styles from './TodoList.module.css';

function TodoList({ todoList, onCompleteTodo, onUpdateTodo, isLoading }) {
  const filteredTodoList = todoList.filter((todo) => !todo.isCompleted);
  if (isLoading) {
    return <p>Todo list loading...</p>;
  }
  if (filteredTodoList.length === 0 && todoList.length > 0) {
    return <p>Add todo above to get started</p>;
  }

  return (
    <ul className={styles.list}>
      {filteredTodoList.map((todo) => (
        <TodoListItem
          key={todo.id}
          todo={todo}
          onCompleteTodo={onCompleteTodo}
          onUpdateTodo={onUpdateTodo}
        />
      ))}
    </ul>
  );
}

export default TodoList;
