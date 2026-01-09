import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToClear, setTaskToClear] = useState(null);
  const [showConfirmDeletePopup, setShowConfirmDeletePopup] = useState(false);
  const [showConfirmClearPopup, setShowConfirmClearPopup] = useState(false);


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
  const nameRegex = /^[A-Za-z\s]{2,50}$/;
  if (!nameInput.trim()) {
    setNameValidation('Name is required.');
    hasError = true;
  }
  else if (!nameRegex.test(nameInput)) {
    setNameValidation('Name must be 2-50 characters long and contain only letters and spaces.');
    hasError = true;
  }
  else {
    setNameValidation('');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.trim()) {
    setEmailValidation('Email is required.');
    hasError = true;
  }
  else if (!emailRegex.test(emailInput)) {
    setEmailValidation('Email is not valid.');
    hasError = true;
  }
  else {
    setEmailValidation('');
  }

  // Phone validation
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (!phoneInput.trim()) {
    setPhoneValidation('Phone is required.');
    hasError = true;
  }
  else if (!phoneRegex.test(phoneInput)) {
    setPhoneValidation('Phone number is not valid');
    hasError = true;
  }
  else {
    setPhoneValidation('');
  }

  // Task validation
  const taskRegex = /^[A-Za-z0-9\s.,'-]{3,100}$/;
  if (!taskInput.trim()) {
    setTaskValidation('Task is required.');
    hasError = true;
  } 
  else if (!taskRegex.test(taskInput)) {
    setTaskValidation('Task must be 3-100 characters long and can include letters, numbers, spaces, and basic punctuation.');
    hasError = true;
  }
  else {
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
        useEffect;
        // Clear editId
        setEditId(null);

        toast.success("Task edited successfully");
      }
      catch (err) {
        toast.error("Failed to edit task");
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
        useEffect;
        // Update tasks state
        setTasks([...tasks, savedTask]);

        toast.success("Task added successfully");
      }
      catch (err) {
        toast.error("Failed to add task");
        console.error('Failed to add task:', err);
      }
    } // end else

    // clear inputs
    clearInputs();
  };

  // delete a task
  const deleteTask = async () => {
    if (!taskToDelete) {
      return;
    }

    try {
      // change the isDeleted flag in backend
      const resIsDeleted = await fetch(`http://localhost:5000/isdeletedtask`, { 
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskToDelete.id, isDeleted: 1 })
      });

      if (!resIsDeleted.ok) {
        throw new Error('Failed to delete task');
      }

      // Delete task from backend
      const resDelete = await fetch(`http://localhost:5000/deletetask?id=${taskToDelete.id}`, { 
        method: "DELETE",
      });

      if (!resDelete.ok) {
        throw new Error('Failed to delete task');
      }

      // Delete task from state
      setTasks(tasks.filter((t: any) => t.id !== taskToDelete.id));
      toast.success("Task deleted successfully");
    }
    catch (err) {
      toast.error("Failed to delete task");
      console.error("Failed to delete task:", err);
    }
    finally {
      setTaskToDelete(null); // hide popup
      setShowConfirmDeletePopup(false);
    }
  };

  // User clicks "No"
  const cancelDelete = () => {
    toast.info("Delete cancelled");
    setTaskToDelete(null); // hide popup
    setShowConfirmDeletePopup(false);
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
      const res = await fetch('http://localhost:5000/cleartasks', {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to clear tasks');
      }
      
      // clear tasks
      setTasks([]);
      // clear inputs
      clearInputs();
      toast.success("All tasks cleared successfully");
    }
    catch (err) {
      toast.error("Failed to clear task");
      console.error('Failed to clear tasks:', err);
    }
    finally {
      setTaskToClear(null); // hide popup
      setShowConfirmClearPopup(false);
    }
  };

  // User clicks "No"
  const cancelClear = () => {
    toast.info("Clear cancelled");
    setTaskToClear(null); // hide popup
    setShowConfirmClearPopup(false);
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
        <ToastContainer
          position="top-center"
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />

        {showConfirmDeletePopup && (
          <div className="confirm-popup">
            <p>Delete this task?</p>
            <div className="popup-actions">
              <button onClick={deleteTask} className="btn danger">Yes</button>
              <button onClick={cancelDelete} className="btn">No</button>
            </div>
          </div>
        )}

        {showConfirmClearPopup && (
          <div className="confirm-popup">
            <p>Clear all tasks?</p>
            <div className="popup-actions">
              <button onClick={clearAll} className="btn danger">Yes</button>
              <button onClick={cancelClear} className="btn">No</button>
            </div>
          </div>
        )}

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
              onChange={(e) => {
                const value = e.target.value;
                setNameInput(value);

                if (value.trim()) {
                  setNameValidation('');
                }
              }}

            />
            { nameValidation && <h4 className="form-invalid">{nameValidation}</h4> }

            <input
              type="text"
              className={`form-input ${emailValidation ? "input-error" : ""}`}
              value={emailInput}
              name="email"
              placeholder="Enter email"
              onChange={(e) => {
                const value = e.target.value;
                setEmailInput(value);

                if (value.trim()) {
                  setEmailValidation('');
                }
              }}
            />
            { emailValidation && <h4 className="form-invalid">{emailValidation}</h4> }

            <input
              type="text"
              className={`form-input ${phoneValidation ? "input-error" : ""}`}
              value={phoneInput}
              name="phone"
              placeholder="Enter phone"
              onChange={(e) => {
                const value = e.target.value;
                setPhoneInput(value);

                if (value.trim()) {
                  setPhoneValidation('');
                }
              }}
            />
            { phoneValidation && <h4 className="form-invalid">{phoneValidation}</h4> }

            <input
              type="text"
              className={`form-input ${taskValidation ? "input-error" : ""}`}
              value={taskInput}
              name="task"
              placeholder="Enter task"
              onChange={(e) => {
                const value = e.target.value;
                setTaskInput(value);

                if (value.trim()) {
                  setTaskValidation('');
                }
              }}
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
              onChange={(e) => {
                const value = e.target.value;
                setCategory(value);

                if (value.trim()) {
                  setCategoryValidation('');
                }
              }}>
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
              onChange={(e) => {
                const value = e.target.value;
                setDeadline(value);

                if (value.trim()) {
                  setDeadlineValidation('');
                }
              }}
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
              <button onClick={() => {
                  setTaskToDelete(task);
                  setShowConfirmDeletePopup(true);
                }} className="delete-btn">
                <i className="fa-solid fa-trash"></i>
                <img src="trash.png" alt="Delete" className="action-icon" />
              </button>
            </div>
          </li>
          ))}
        </ul>

        <button onClick={() => { setShowConfirmClearPopup(true); }}
          className="btn clear-btn">Clear All</button>
      </div>
    </>
  )
}

export default App
