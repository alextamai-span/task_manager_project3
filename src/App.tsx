import React, { useState, useEffect } from 'react';
import './App.css';


function App() {
  // declaring variables 
  const [taskInput, setTaskInput] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Select');
  const [deadline, setDeadline] = useState('');
  const [editId, setEditId] = useState(null);

  // storing a task in local storage
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('tasks');
      if (saved && saved !== "undefined") {
        return JSON.parse(saved);
      }
    }
    catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
    return [];
  });

  // update task in local storage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    fetch('http://localhost:5000/api')
      .then((res) => res.json())
      .then((data) => console.log(data))
    // fetch('http://localhost:5000/addtask')
    //   .then((res) => res.json())
    //   .then((data) => console.log(data))
  }, [tasks]);

  // on submit 
  const handleSubmit = (e:any) => {
    e.preventDefault();

    // validating task
    if(!taskInput.trim()) {
      alert('Please add an task!')
      return;
    }

    // validating category
    if (category === 'Select') {
      alert('Please select a category!')
      return;
    }

    // validating date
    const today = new Date().toISOString().split('T')[0];
    if (!deadline || deadline < today) {
      alert('Please select a date in the future!');
      return;
    }

    // successful task
    const new_task = {
        id: Math.floor(Math.random() * 10000000),
        title: taskInput,
        description: description,
        category: category,
        deadline: deadline,
        isCompleted: false
    };

    // update the local storage
    setTasks([...tasks, new_task]);
    
    // clear
    setTaskInput('');
    setDescription('');
    setCategory('Select');
    setDeadline('');
  };

  const removeTask = (id:any) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleComplete = (id:any) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const startEdit = (task:any) => {
    setEditId(task.id);
    setTaskInput(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setDeadline(task.deadline);

    removeTask(task.id);
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      setTasks([]);

      // clear
      setTaskInput('');
      setDescription('');
      setCategory('Select');
      setDeadline('');
    }
  };

  return (
    <>
      <div>
        <header>
          <h1>Task Manager</h1>
        </header>

        <form id="task-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-input"
              value={taskInput}
              name="task"
              placeholder="Enter task"
              onChange={(e) => setTaskInput(e.target.value)}
            />

            <input
              type="text"
              className="form-input"
              value={description}
              name="description"
              placeholder="Enter description (optional)"
              onChange={(e) => setDescription(e.target.value)}
            />

            <label htmlFor="Category">Category: </label>
            <select name="categories" value={category} onChange={(e) => setCategory(e.target.value)} className="form-category">
              <option value="Select">Select</option>
              <option value="Work">Work</option>
              <option value="Family">Family</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="Deadline">Deadline: </label>
            <input
              type="date"
              className="form-deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
        
            <button type="submit" className="btn">
              <i className="fa-solid fa-plus"></i>Add Task
            </button>
        </form>

        <ul id="task-list" className="tasks">{tasks.map(task => (
          <li key={task.id} className={task.isCompleted ? 'completed-task' : ''}>
            <div className="task-info">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p><strong>Category:</strong> {task.category}</p>
              <p><strong>Deadline:</strong> {task.deadline}</p>
            </div>
            
            <div className="task-actions">
              <button onClick={() => toggleComplete(task.id)} className="complete-btn">
                <i className="fa-solid fa-check"></i>
                <img src="check.png" alt="Complete" className="action-icon" />
              </button>
              <button onClick={() => startEdit(task)} className="edit-btn">
                <i className="fa-solid fa-pen"></i>
                <img src="edit.png" alt="Edit" className="action-icon" />
              </button>
              <button onClick={() => removeTask(task.id)} className="delete-btn">
                <i className="fa-solid fa-trash"></i>
                <img src="trash.png" alt="Delete" className="action-icon" />
              </button>
            </div>
          </li>
          ))}
        </ul>

        <button onClick={clearAll} className="btn clear-btn">Clear All</button>
      </div>
    </>
  )
}

export default App
