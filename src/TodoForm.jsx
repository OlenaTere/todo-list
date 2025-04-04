export default function TodoForm() {
    return (
    <form>
        <label htmlFor="todoTitle">Todo</label>
        <input id="todoTitle"></input> 
        <button type="submit">Add Todo</button>
    </form>
);
}