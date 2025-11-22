import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import service from './service.js';

function App() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  // בדיקה אם המשתמש מחובר
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    getTodos();
  }, []);

  // async function getTodos() {
  //   try {
  //     const todos = await service.getTasks();
  //     setTodos(todos);
  //   } catch (err) {
  //     console.error("Error fetching todos:", err);
  //     if (err.response?.status === 401) {
  //       navigate("/login");
  //     }
  //   }
  // }
  async function getTodos() {
    try {
      const todos = await service.getTasks();
      console.log("Todos from API:", todos); // 🔍 הוסף את זה!
      
      // תיקון: וודא שזה מערך
      if (Array.isArray(todos)) {
        setTodos(todos);
      } else if (todos && Array.isArray(todos.data)) {
        setTodos(todos.data);
      } else {
        console.error("Invalid todos format:", todos);
        setTodos([]);
      }
    } catch (err) {
      console.error("Error fetching todos:", err);
      setTodos([]); // 🔧 הוסף את זה!
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  }

  async function createTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await service.addTask({ name: newTodo, isComplete: false });
    setNewTodo("");
    await getTodos();
  }

  async function updateCompleted(todo, isComplete) {
    await service.updateTask(todo.id, { ...todo, isComplete });
    await getTodos();
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos();
  }

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <form onSubmit={createTodo}>
          <input
            className="new-todo"
            placeholder="Well, let's take on the day"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
        </form>
      </header>

      <section className="main" style={{ display: "block" }}>
        <ul className="todo-list">
          {todos.map((todo) => (
            <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
              <div className="view">
                <input
                  className="toggle"
                  type="checkbox"
                  defaultChecked={todo.isComplete}
                  onChange={(e) => updateCompleted(todo, e.target.checked)}
                />
                <label>{todo.name}</label>
                <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

export default App;
