import { useState } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';

function TodosViewForm({
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
  queryString,
  setQueryString,
}) {
  const preventRefresh = (e) => e.preventDefault();
  const [localQueryString, setLocalQueryString] = useState(queryString);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setQueryString(localQueryString);
    }, 500);

    return () => clearTimeout(debounce); // cleanup to avoid overlapping calls
  }, [localQueryString, setQueryString]);

  return (
    <StyledForm onSubmit={preventRefresh}>
      <StyledField>
        <label>Search todos</label>
        <input
          type="text"
          value={localQueryString}
          onChange={(e) => setLocalQueryString(e.target.value)}
        />
        <button type="button" onClick={() => setLocalQueryString('')}>
          Clear
        </button>
      </StyledField>

      <label>Sort by</label>
      <select onChange={(e) => setSortField(e.target.value)} value={sortField}>
        <option value="title">Title</option>
        <option value="createdTime">Time added</option>
      </select>

      <label>Direction</label>
      <select
        id="sortDirection"
        onChange={(e) => setSortDirection(e.target.value)}
        value={sortDirection}
      >
        <option value="desc">Descending</option>
      </select>
    </StyledForm>
  );
}

export default TodosViewForm;

const StyledForm = styled.form`
  padding: 1rem 0;
`;

const StyledField = styled.div`
  padding: 0.5rem 0;
`;
