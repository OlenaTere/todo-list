import './App.css';
import TodoList from './features/TodoList/TodoList';
import TodoForm from './features/TodoForm';
import { useEffect, useState, useReducer } from 'react';
import TodosViewForm from './features/TodosViewForm';
import { useCallback } from 'react';
import styles from './App.module.css';
import {
  reducer as todosReducer,
  actions as todoActions,
  initialState as initialTodosState,
} from './reducers/todos.reducer';

const url = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
const token = `Bearer ${import.meta.env.VITE_PAT}`;

// const encodeUrl = ({ sortField, sortDirection, queryString }) => {
//   let sortQuery = `sort[0][field]=${sortField}&sort[0][direction]=${sortDirection}`;
//   let searchQuery = '';

//   if (queryString) {
//     searchQuery = `&filterByFormula=SEARCH("${queryString}", title)`;
//   }
//   return encodeURI(`${url}?${sortQuery}${searchQuery}`);
// };

function App() {
  // const [todoList, setTodoList] = useState([]);
  // const [isLoading, setIsLoading] = useState(false); //we dont need that anymore
  // const [errorMessage, setErrorMessage] = useState('');
  // const [isSaving, setIsSaving] = useState(false);
  const [sortField, setSortField] = useState('createdTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [queryString, setQueryString] = useState('');
  const [todoState, dispatch] = useReducer(todosReducer, initialTodosState);
  const encodeUrl = useCallback(() => {
    let sortQuery = `sort[0][field]=${sortField}&sort[0][direction]=${sortDirection}`;
    let searchQuery = '';

    if (queryString) {
      searchQuery = `&filterByFormula=SEARCH("${queryString}", title)`;
    }
    return encodeURI(`${url}?${sortQuery}${searchQuery}`);
  }, [sortField, sortDirection, queryString]);

  useEffect(() => {
    const fetchTodos = async () => {
      //setIsLoading(true); //old version from week 10
      dispatch({ type: todoActions.fetchTodos });

      const options = {
        method: 'GET',
        headers: { Authorization: token },
      };

      try {
        const resp = await fetch(encodeUrl(), options);
        if (!resp.ok) {
          throw new Error(resp.message);
        }
        const { records } = await resp.json();

        // const todos = records
        //   .filter((record) => record.fields && record.fields.title) //only keep title that actually have a title in Airtable
        //   .map((record) => ({
        //     id: record.id,
        //     title: record.fields.title.trim(), //clean the title (remove empty spaces)
        //     isCompleted: record.fields.isCompleted ?? false, //if isCompleted is missing, default it to false
        //   }));

        //setTodoList(todos); //old version from week 10
        dispatch({
          type: todoActions.loadTodos, // Dispatch action to load todos
          records, // Add the records directly to the action object
        });
      } catch (error) {
        //setErrorMessage(error.message); //old version from week 10
        dispatch({
          type: todoActions.setLoadError, // Dispatch error if fetching fails
          error: error.message, // Pass the error message
        });
      } finally {
        //setIsLoading(false); //old version from week 10
        dispatch({ type: todoActions.endRequest }); //that was not mentioned in the instructions
      }
    };

    fetchTodos();
  }, [encodeUrl]);

  const handleAddTodo = async (newTodo) => {
    dispatch({ type: todoActions.startRequest });
    //setIsSaving(true);
    const payload = {
      records: [
        {
          fields: {
            title: newTodo.title,
            isCompleted: newTodo.isCompleted,
          },
        },
      ],
    };
    const options = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    try {
      //setIsSaving(true);
      const resp = await fetch(encodeUrl(), options);
      if (!resp.ok) {
        throw new Error(resp.message);
      }
      const { records } = await resp.json();
      const first = records[0];
      // const savedTodo = {
      //   id: records[0].id,
      //   ...records[0].fields,
      // };
      // if (!records[0].fields.isCompleted) {
      //   savedTodo.isCompleted = false;
      // }
      // setTodoList([...todoList, savedTodo]);
      dispatch({
        type: todoActions.addTodo,
        records: first,
      });
    } catch (error) {
      //console.log('error: ', error); //do not need that anymore, week 11
      //setErrorMessage(error.message);
      dispatch({
        type: todoActions.setLoadError,
        error: error.message,
      });
    } finally {
      //setIsSaving(false);
      dispatch({ type: todoActions.endRequest });
    }
  };

  const completeTodo = async (id) => {
    // 1. Optimistically update the UI: Mark the todo as completed immediately in the UI
    // const updatedTodos = todoList.map((todo) => {
    //   if (todo.id === id) {
    //     return { ...todo, isCompleted: true };
    //   }
    //   return todo;
    // });
    // setTodoList(updatedTodos);
    const originalTodo = todoState.todoList.find((t) => t.id === id);
    dispatch({ type: todoActions.completeTodo, id });

    // 2. Create the payload to send to Airtable
    const todoToUpdate = todoState.todoList.find((todo) => todo.id === id);
    const payload = {
      records: [
        {
          id: todoToUpdate.id,
          fields: {
            isCompleted: true, // Mark the todo as completed
          },
        },
      ],
    };

    const options = {
      method: 'PATCH',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    try {
      // 3. Send the PATCH request to Airtable
      const resp = await fetch(encodeUrl(), options);
      if (!resp.ok) {
        throw new Error('Failed to mark todo as complete');
      }

      // 4. Handle successful response from Airtable
      const { records: _records } = await resp.json();
      // const updatedTodo = {
      //   id: records[0].id,
      //   ...records[0].fields,
      // };

      // Revert UI update if something goes wrong
      // if (!records[0].fields.isCompleted) {
      //   updatedTodo.isCompleted = false;
      // }

      // 5. Update the UI state with the updated todo
      // const finalTodos = todoList.map((todo) =>
      //   todo.id === updatedTodo.id ? { ...updatedTodo } : todo
      // );
      // setTodoList(finalTodos);
    } catch (error) {
      // 6. If error occurs, revert the UI and display the error
      //setErrorMessage(`${error.message}. Reverting todo...`);

      // Find the original todo that was updated optimistically and revert the change
      // const revertedTodos = todoList.map((todo) =>
      //   todo.id === id ? { ...todo, isCompleted: false } : todo
      // );
      // setTodoList(revertedTodos);
      dispatch({
        type: todoActions.revertTodo,
        originalTodo,
      });
      dispatch({
        type: todoActions.setLoadError,
        error: error.message,
      });
    } finally {
      // 7. Reset any saving/loading states
      //setIsSaving(false);
    }
  };

  const updateTodo = async (editedTodo) => {
    const originalTodo = todoState.todoList.find(
      (todo) => todo.id === editedTodo.id
    );
    //optimistically update UI
    dispatch({
      type: todoActions.updateTodo,
      editedTodo,
    });
    const payload = {
      records: [
        {
          id: editedTodo.id,
          fields: {
            title: editedTodo.title,
            isCompleted: editedTodo.isCompleted,
          },
        },
      ],
    };

    const options = {
      method: 'PATCH',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    try {
      //setIsSaving(true);
      const resp = await fetch(encodeUrl(), options);
      if (!resp.ok) {
        throw new Error(resp.message);
      }
      const { records: _records } = await resp.json();
      // const updatedTodo = {
      //   id: records[0].id,
      //   ...records[0].fields,
      // };
      // if (!records[0].fields.isCompleted) {
      //   updatedTodo.isCompleted = false;
      // }

      // const updatedTodos = todoList.map((todo) => {
      //   if (todo.id === updatedTodo.id) {
      //     return { ...updatedTodo };
      //   } else {
      //     return todo;
      //   }
      // });
      // setTodoList([...updatedTodos]);
    } catch (error) {
      //console.log('error: ', error);
      // setErrorMessage(`${error.message}. Reverting todo...`);
      // const revertedTodos = todoList.map((todo) => {
      //   if (todo.id === originalTodo.id) {
      //     return originalTodo;
      //   } else {
      //     return todo;
      //   }
      // });
      // setTodoList([...revertedTodos]);
      dispatch({
        type: todoActions.revertTodo,
        originalTodo,
      });
      dispatch({
        type: todoActions.setLoadError,
        error: error.message,
      });
    } finally {
      //setIsSaving(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <h1>My todos</h1>
      <TodoForm onAddTodo={handleAddTodo} isSaving={todoState.isSaving} />
      <TodoList
        todoList={todoState.todoList}
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

      {/* {todoState.errorMessage && (
        <div className={styles.errorMessage}>{todoState.errorMessage}</div>
      )} */}

      {todoState.errorMessage && (
        <div className={styles.errorMessage}>
          <hr />
          <p>{todoState.errorMessage}</p>
          <button onClick={() => dispatch({ type: todoActions.clearError })}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
