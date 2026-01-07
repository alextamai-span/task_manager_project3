import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // declaring variables 
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Select');
  const [deadline, setDeadline] = useState('');
  const [editId, setEditId] = useState(null);
  const [nameValidation, setNameValidation] = useState('');
  const [emailValidation, setEmailValidation] = useState('');
  const [phoneValidation, setPhoneValidation] = useState('');
  const [taskValidation, setTaskValidation] = useState('');
  const [categoryValidation, setCategoryValidation] = useState('');
  const [deadlineValidation, setDeadlineValidation] = useState('');

  // storing a task in SQLite database
  const [tasks, setTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      return storedTasks ? JSON.parse(storedTasks) : [];
    }
    catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
    return [];
  });

  // fetching tasks from backend server
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:5000/listtotask');
        const data = await res.json();
        setTasks(data.tasks);
      }
      catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchTasks();
  }, []);

// Validation function
const validateForm = () => {
  let hasError = false;

  // Name validation
  if (!nameInput.trim()) {
    setNameValidation('Name is required.');
    hasError = true;
  } else {
    setNameValidation('');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.trim()) {
    setEmailValidation('Email is required.');
    hasError = true;
  } else if (!emailRegex.test(emailInput)) {
    setEmailValidation('Email is not valid.');
    hasError = true;
  } else {
    setEmailValidation('');
  }

  // Phone validation
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (!phoneInput.trim()) {
    setPhoneValidation('Phone is required.');
    hasError = true;
  } else if (!phoneRegex.test(phoneInput)) {
    setPhoneValidation('Phone number is not valid');
    hasError = true;
  } else {
    setPhoneValidation('');
  }

  // Task validation
  if (!taskInput.trim()) {
    setTaskValidation('Task is required.');
    hasError = true;
  } else {
    setTaskValidation('');
  }

  // Category validation
  if (category === 'Select') {
    setCategoryValidation('Category is required.');
    hasError = true;
  } else {
    setCategoryValidation('');
  }

  // Deadline validation
  const today = new Date().toISOString().split('T')[0];
  if (!deadline || deadline < today) {
    setDeadlineValidation('Deadline is invalid.');
    hasError = true;
  } else {
    setDeadlineValidation('');
  }

  return hasError;
};

// handleSubmit using the validation function
const handleSubmit = async (e: any) => {
  e.preventDefault();

  // validate form
  const hasError = validateForm();

  if (hasError) {
    return;
  }

  if (editId) {
    // Editing an existing task
    const updatedTask = {
      id: editId,
      name: nameInput,
      email: emailInput,
        phone: phoneInput,
        title: taskInput,
        description,
        category,
        deadline
      };

      try {
        // Add updated task
        const resEdit = await fetch('http://localhost:5000/edittask', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask)
        });

        if (!resEdit.ok) {
          throw new Error('Failed to add updated task');
        }
        // Get new task from response
        const newTask = await resEdit.json();

        // Update tasks state
        setTasks(tasks.map((t:any) => t.id === editId ? newTask : t));
        // Clear editId
        setEditId(null);
      }
      catch (err) {
        console.error('Failed to edit task:', err);
      }
    } 
    else {
      // successful task
      const new_task = {
          name: nameInput,
          email: emailInput,
          phone: phoneInput,
          title: taskInput,
          description: description,
          category: category,
          deadline: deadline,
          isCompleted: false
      };

      try {
        // Add new task
        const res = await fetch('http://localhost:5000/addtask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(new_task)
        });

        if (!res.ok) {
          throw new Error('Failed to add task');
        }

        // Get saved task from response
        const savedTask = await res.json();
        // Update tasks state
        setTasks([...tasks, savedTask]);
      }
      catch (err) {
        console.error('Failed to add task:', err);
      }
    } // end else
    
    // clear inputs
    clearInputs();
  };

  // delete a task
  const deleteTask = async (task:any) => {
    try {
      // confirm delete
      if (window.confirm("Are you sure you want to delete this task?")) {
        // delete task from backend
        const res = await fetch(`http://localhost:5000/deletetask?id=${task.id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          throw new Error('Failed to update task');
        }
        
        // delete task from state
        setTasks(tasks.filter((t: any) => t.id !== task.id));
      }
    }
    catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // toggle task completion
  const toggleComplete = async (task:any) => {
    // update task completion status
    const updated = { 
      ...task, 
      isCompleted: !task.isCompleted
    };

    try {
      // update task in backend
      const res = await fetch(`http://localhost:5000/completetask?id=${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }
  
      // update task in state
      setTasks(tasks.map((t: any) => t.id === task.id ? updated : t));
    }
    catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  // start editing a task
  const startEdit = async (task:any) => {
    // populate input fields with task data
    setEditId(task.id);
    setNameInput(task.name);
    setEmailInput(task.email);
    setPhoneInput(task.phone);
    setTaskInput(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setDeadline(task.deadline);
  };

  // clear all tasks
  const clearAll = async () => {
    try {
      // confirm clear all
      if (window.confirm("Are you sure you want to clear all tasks?")) {
        // clear tasks from state
        setTasks([]);

        // clear tasks from backend
        const res = await fetch('http://localhost:5000/cleartasks', {
          method: 'DELETE'
        });

        if (!res.ok) {
          throw new Error('Failed to clear tasks');
        }

        // clear inputs
        clearInputs();
      }
    }
    catch (err) {
      console.error('Failed to clear tasks:', err);
    }
  };

  // clear input fields
  const clearInputs = () => {
    setNameInput('');
    setEmailInput('');
    setPhoneInput('');
    setTaskInput('');
    setDescription('');
    setCategory('Select');
    setDeadline('');
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
              className={`form-input ${nameValidation ? "input-error" : ""}`}
              value={nameInput}
              name="name"
              placeholder="Enter name"
              onChange={(e) => setNameInput(e.target.value)}
            />
            { nameValidation && <h4 className="form-invalid">{nameValidation}</h4> }

            <input
              type="text"
              className={`form-input ${emailValidation ? "input-error" : ""}`}
              value={emailInput}
              name="email"
              placeholder="Enter email"
              onChange={(e) => setEmailInput(e.target.value)}
            />
            { emailValidation && <h4 className="form-invalid">{emailValidation}</h4> }

            <input
              type="text"
              className={`form-input ${phoneValidation ? "input-error" : ""}`}
              value={phoneInput}
              name="phone"
              placeholder="Enter phone"
              onChange={(e) => setPhoneInput(e.target.value)}
            />
            { phoneValidation && <h4 className="form-invalid">{phoneValidation}</h4> }

            <input
              type="text"
              className={`form-input ${taskValidation ? "input-error" : ""}`}
              value={taskInput}
              name="task"
              placeholder="Enter task"
              onChange={(e) => setTaskInput(e.target.value)}
            />
            { taskValidation && <h4 className="form-invalid">{taskValidation}</h4> }

            <input
              type="text"
              className="form-input"
              value={description}
              name="description"
              placeholder="Enter description (optional)"
              onChange={(e) => setDescription(e.target.value)}
            />

            <label htmlFor="Category">Category: </label>
            <select 
              name="categories"
              className={`form-category ${categoryValidation ? "input-error" : ""}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}>
              <option value="Select">Select</option>
              <option value="Work">Work</option>
              <option value="Family">Family</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
            { categoryValidation && <h4 className="form-invalid">{categoryValidation}</h4> }

            <label htmlFor="Deadline">Deadline: </label>
            <input
              type="date"
              className={`form-deadline ${deadlineValidation ? "input-error" : ""}`}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            { deadlineValidation && <h4 className="form-invalid">{deadlineValidation}</h4> }
        
            <button type="submit" className="btn">
              {editId ? "Update Task" : "Add Task"}
            </button>
        </form>

        <ul id="task-list" className="tasks">{tasks.map((task: any) => (
          <li key={task.id} className={task.isCompleted ? 'completed-task' : ''}>
            <div className="task-info">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p><strong>Name:</strong> {task.name}</p>
              <p><strong>Email:</strong> {task.email}</p>
              <p><strong>Phone:</strong> {task.phone}</p>
              <p><strong>Category:</strong> {task.category}</p>
              <p><strong>Deadline:</strong> {task.deadline}</p>
            </div>
            
            <div className="task-actions">
              <button onClick={() => toggleComplete(task)} className="complete-btn">
                <i className="fa-solid fa-check"></i>
                <img src="check.png" alt="Complete" className="action-icon" />
              </button>
              <button onClick={() => startEdit(task)} className="edit-btn">
                <i className="fa-solid fa-pen"></i>
                <img src="edit.png" alt="Edit" className="action-icon" />
              </button>
              <button onClick={() => deleteTask(task)} className="delete-btn">
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
