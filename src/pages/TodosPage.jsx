import TodoForm from '../features/TodoForm';
import TodoList from '../features/TodoList/TodoList';
import TodosViewForm from '../features/TodosViewForm';

export default function TodosPage({
  todoState,
  todosOnCurrentPage,
  handleAddTodo,
  completeTodo,
  updateTodo,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  queryString,
  setQueryString,
}) {
  return (
    <div>
      <TodoForm onAddTodo={handleAddTodo} isSaving={todoState.isSaving} />
      <TodoList
        todoList={todosOnCurrentPage}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        isLoading={todoState.isLoading}
      />
      <hr />
      <TodosViewForm
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        queryString={queryString}
        setQueryString={setQueryString}
      />
    </div>
  );
}
