function ToDo({ todo, removeTask, toggleTask }) {
  return (
    <div className="item-todo">
      
      <div
        className={todo.complete ? "item-text strike" : "item-text"}
        onClick={() => toggleTask(todo.id)}
      >
        {todo.task}
      </div>

      <button className="item-delete" onClick={() => removeTask(todo.id)}>
        x
      </button>

    </div>
  );
}

export default ToDo;