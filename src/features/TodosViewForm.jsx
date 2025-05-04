function TodosViewForm({
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
  queryString,
  setQueryString,
}) {
  const preventRefresh = (e) => e.preventDefault();

  return (
    <form onSubmit={preventRefresh}>
      <div>
        <label>Search todos</label>
        <input
          type="text"
          value={queryString}
          onChange={(e) => setQueryString(e.target.value)}
        />
        <button type="button" onClick={() => setQueryString('')}>
          Clear
        </button>
      </div>

      <label>Sort by</label>
      <select>
        <option value="title">Title</option>
        <option value="createdTime">Time added</option>
        onChange={(e) => setSortField(e.target.value)}
        value{sortField};
      </select>

      <label>Direction</label>
      <select>
        <option value="desc">Descending</option>
        id="sortDirection" onChange={(e) => setSortDirection(e.target.value)}
        value={sortDirection}
      </select>
    </form>
  );
}

export default TodosViewForm;
