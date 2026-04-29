import { useState } from "react";

function ToDoForm({ addTask }) {
  const [userInput, setUserInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (userInput.trim() === "") {
      return;
    }

    addTask(userInput);
    setUserInput("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={userInput}
        type="text"
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Введите задачу..."
      />
      <button>Сохранить</button>
    </form>
  );
}

export default ToDoForm;