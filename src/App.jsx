import './App.css';
import TodoList from './features/TodoList/TodoList';
import TodoForm from './features/TodoForm';
import { useEffect, useState } from 'react';
import TodosViewForm from './features/TodosViewForm';
import { useCallback } from 'react';

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
  const [todoList, setTodoList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sortField, setSortField] = useState('createdTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [queryString, setQueryString] = useState('');
  const encodeUrl = useCallback(()=>{let sortQuery = `sort[0][field]=${sortField}&sort[0][direction]=${sortDirection}`;
  let searchQuery = '';

  if (queryString) {
    searchQuery = `&filterByFormula=SEARCH("${queryString}", title)`;
  }
  return encodeURI(`${url}?${sortQuery}${searchQuery}`);},[sortField, sortDirection, queryString]);

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);

      const options = {
        method: 'GET',
        headers: { Authorization: token },
      };

      try {
        const resp = await fetch(
          encodeUrl(),
          options
        );
        if (!resp.ok) {
          throw new Error(resp.message);
        }
        const { records } = await resp.json();

        const todos = records
          .filter((record) => record.fields && record.fields.title) //only keep title that actually have a title in Airtable
          .map((record) => ({
            id: record.id,
            title: record.fields.title.trim(), //clean the title (remove empty spaces)
            isCompleted: record.fields.isCompleted ?? false, //if isCompleted is missing, default it to false
          }));

        setTodoList(todos);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [encodeUrl]);

  const handleAddTodo = async (newTodo) => {
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
      setIsSaving(true);
      const resp = await fetch(
        encodeUrl(),
        options
      );
      if (!resp.ok) {
        throw new Error(resp.message);
      }
      const { records } = await resp.json();
      const savedTodo = {
        id: records[0].id,
        ...records[0].fields,
      };
      if (!records[0].fields.isCompleted) {
        savedTodo.isCompleted = false;
      }
      setTodoList([...todoList, savedTodo]);
    } catch (error) {
      console.log('error: ', error);
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const completeTodo = async (id) => {
    // 1. Optimistically update the UI: Mark the todo as completed immediately in the UI
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isCompleted: true };
      }
      return todo;
    });
    setTodoList(updatedTodos);

    // 2. Create the payload to send to Airtable
    const todoToUpdate = todoList.find((todo) => todo.id === id);
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
      const resp = await fetch(
        encodeUrl(),
        options
      );
      if (!resp.ok) {
        throw new Error('Failed to mark todo as complete');
      }

      // 4. Handle successful response from Airtable
      const { records } = await resp.json();
      const updatedTodo = {
        id: records[0].id,
        ...records[0].fields,
      };

      // Revert UI update if something goes wrong
      if (!records[0].fields.isCompleted) {
        updatedTodo.isCompleted = false;
      }

      // 5. Update the UI state with the updated todo
      const finalTodos = todoList.map((todo) =>
        todo.id === updatedTodo.id ? { ...updatedTodo } : todo
      );
      setTodoList(finalTodos);
    } catch (error) {
      // 6. If error occurs, revert the UI and display the error
      setErrorMessage(`${error.message}. Reverting todo...`);

      // Find the original todo that was updated optimistically and revert the change
      const revertedTodos = todoList.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: false } : todo
      );
      setTodoList(revertedTodos);
    } finally {
      // 7. Reset any saving/loading states
      setIsSaving(false);
    }
  };

  const updateTodo = async (editedTodo) => {
    const originalTodo = todoList.find((todo) => todo.id === editedTodo.id);
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
      setIsSaving(true);
      const resp = await fetch(
        encodeUrl(),
        options
      );
      if (!resp.ok) {
        throw new Error(resp.message);
      }
      const { records } = await resp.json();
      const updatedTodo = {
        id: records[0].id,
        ...records[0].fields,
      };
      if (!records[0].fields.isCompleted) {
        updatedTodo.isCompleted = false;
      }

      const updatedTodos = todoList.map((todo) => {
        if (todo.id === updatedTodo.id) {
          return { ...updatedTodo };
        } else {
          return todo;
        }
      });
      setTodoList([...updatedTodos]);
    } catch (error) {
      console.log('error: ', error);
      setErrorMessage(`${error.message}. Reverting todo...`);
      const revertedTodos = todoList.map((todo) => {
        if (todo.id === originalTodo.id) {
          return originalTodo;
        } else {
          return todo;
        }
      });
      setTodoList([...revertedTodos]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1>My todos</h1>
      <TodoForm onAddTodo={handleAddTodo} isSaving={isSaving} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        isLoading={isLoading}
      ></TodoList>
      <hr />
      <TodosViewForm
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        queryString={queryString}
        setQueryString={setQueryString}
      />

      {errorMessage && (
        <div>
          <hr />
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

export default App;
