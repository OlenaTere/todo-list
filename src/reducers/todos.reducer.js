const actions = {
  //actions in useEffect that loads todos
  fetchTodos: 'fetchTodos',
  loadTodos: 'loadTodos',
  //found in useEffect and addTodo to handle failed requests
  setLoadError: 'setLoadError',
  //actions found in addTodo
  startRequest: 'startRequest',
  addTodo: 'addTodo',
  endRequest: 'endRequest',
  //found in helper functions
  updateTodo: 'updateTodo',
  completeTodo: 'completeTodo',
  //reverts todos when requests fail
  revertTodo: 'revertTodo',
  //action on Dismiss Error button
  clearError: 'clearError',
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case actions.fetchTodos:
      return {
        ...state,
        isLoading: true,
      };
    case actions.loadTodos: {
      const todos = action.records
        .filter((record) => record.fields && record.fields.title)
        .map((record) => ({
          id: record.id,
          title: record.fields.title.trim(),
          isCompleted: record.fields.isCompleted ?? false,
        }));
      return {
        ...state,
        todoList: todos,
        isLoading: false,
      };
    }
    case actions.setLoadError:
      return {
        ...state,
        errorMessage: action.error,
        isLoading: false,
        isSaving: false,
      };
    case actions.startRequest:
      return {
        ...state,
        isSaving: true,
      };
    case actions.addTodo: {
      const record = action.records; //added because new todo showed up only after refreshing
      const savedTodo = {
        //id: action.todo.id,
        id: record.id,
        //...action.todo.fields,
        title: record.fields.title.trim(),
        //isCompleted: action.todo.fields.isCompleted ?? false,
        isCompleted: record.fields.isCompleted ?? false,
      };
      return {
        ...state,
        todoList: [...state.todoList, savedTodo],
        isSaving: false,
      };
    }

    case actions.endRequest:
      return {
        ...state,
        isLoading: false,
        isSaving: false,
      };
    case actions.updateTodo: {
      const { editedTodo } = action;
      //const original = state.todoList.find(todo => todo.id === editedTodo.id);
      return {
        ...state,
        //undoStack: { ...state.undoStack, [original.id]: original },
        todoList: state.todoList.map((todo) =>
          todo.id === editedTodo.id ? editedTodo : todo
        ),
      };
    }

    case actions.completeTodo: {
      const { id } = action;
      return {
        ...state,
        // mark it completed immediately in the UI
        todoList: state.todoList.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: true } : todo
        ),
      };
    }
    case actions.revertTodo: {
      const { originalTodo } = action;

      return {
        ...state,
        todoList: state.todoList.map((todo) =>
          todo.id === originalTodo.id ? originalTodo : todo
        ),
      };
    }
    case actions.clearError:
      return {
        ...state,
        errorMessage: '',
      };
    default:
      return state;
  }
}

const initialState = {
  todoList: [],
  isLoading: false,
  isSaving: false,
  errorMessage: '',
};

export { initialState };
export { actions };
export { reducer };
