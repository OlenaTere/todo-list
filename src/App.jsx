import './App.css';
import { useEffect, useState, useReducer, useCallback } from 'react';
import styles from './App.module.css';
import {
  reducer as todosReducer,
  actions as todoActions,
  initialState as initialTodosState,
} from './reducers/todos.reducer';
import TodosPage from './pages/TodosPage';
import Header from './shared/Header';
import {
  useLocation,
  Routes,
  Route,
  useSearchParams,
  useNavigate,
} from 'react-router';
import About from './pages/About';
import NotFound from './pages/NotFound';

const url = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
const token = `Bearer ${import.meta.env.VITE_PAT}`;

function App() {
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

  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = 15;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const filteredTodoList = todoState.todoList;
  const indexOfFirstTodo = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(filteredTodoList.length / itemsPerPage);
  const navigate = useNavigate();
  const todosOnCurrentPage = filteredTodoList.slice(
    indexOfFirstTodo,
    indexOfFirstTodo + itemsPerPage
  );
  console.log('todosOnCurrentPage', todosOnCurrentPage);

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

        dispatch({
          type: todoActions.loadTodos, // Dispatch action to load todos
          records, // Add the records directly to the action object
        });
      } catch (error) {
        dispatch({
          type: todoActions.setLoadError, // Dispatch error if fetching fails
          error: error.message, // Pass the error message
        });
      } finally {
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
      dispatch({
        type: todoActions.addTodo,
        records: first,
      });
    } catch (error) {
      dispatch({
        type: todoActions.setLoadError,
        error: error.message,
      });
    } finally {
      dispatch({ type: todoActions.endRequest });
    }
  };

  const completeTodo = async (id) => {
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
    } catch (error) {
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
    } catch (error) {
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

  const location = useLocation();
  const [title, setTitle] = useState('Todo List');

  useEffect(() => {
    if (location.pathname === '/') {
      setTitle('Todo List');
    } else if (location.pathname === '/about') {
      setTitle('About');
    } else {
      setTitle('Not found');
    }
  }, [location]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setSearchParams({ page: (currentPage - 1).toString() });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setSearchParams({ page: (currentPage + 1).toString() });
    }
  };

  useEffect(() => {
    if (totalPages > 0) {
      if (isNaN(currentPage) || currentPage < 1 || currentPage > totalPages) {
        navigate('/');
      }
    }
  }, [currentPage, totalPages, navigate]);
  console.log('todoState.todoList', todoState.todoList);

  return (
    <>
      <Header title={title} />
      <div className={styles.appContainer}>
        <Routes>
          <Route
            path="/"
            element={
              <TodosPage
                todoState={todoState}
                todosOnCurrentPage={
                  todosOnCurrentPage} /* Pass the paginated data */
                handleAddTodo={handleAddTodo}
                completeTodo={completeTodo}
                updateTodo={updateTodo}
                sortField={sortField}
                setSortField={setSortField}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                queryString={queryString}
                setQueryString={setQueryString}
              />
            }
          ></Route>
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {todoState.errorMessage && (
          <div className={styles.errorMessage}>
            <hr />
            <p>{todoState.errorMessage}</p>
            <button onClick={() => dispatch({ type: todoActions.clearError })}>
              Dismiss
            </button>
          </div>
        )}
        <div className={styles.paginationControls}>
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
