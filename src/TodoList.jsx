import TodoListItem from "./TodoListItem";

const todos = [
    {id: 1, title: "review resources"},
    {id: 2, title: "take notes"},
    {id: 3, title: "code out app"},
]

export default function TodoList(){
    return (
    <ul> {
        todos.map((todo) => (
        <TodoListItem key={todo.id} title={todo.title}/>
    ))
    } </ul>
);
}


