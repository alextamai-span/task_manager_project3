import sqlite3 from 'sqlite3'
import express from 'express'; // run backend server - fastify does same thing
import bodyParser from 'body-parser';
import cors from 'cors';

const sql3 = sqlite3.verbose()

// find or creates db file
const db = new sql3.Database('database.db', sqlite3.OPEN_READWRITE, connection)

// create connection
function connection(err) {
    if (err) {
        return console.log('connection error:', err)
    }
    console.log('connection success')
}

// create table if the table does not exist
let sql = `
  CREATE TABLE IF NOT EXISTS test_table (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT, 
  description TEXT,
  category TEXT,
  deadline DATE,
  isCompleted INTEGER DEFAULT 0
)`;

// table created
db.run(sql, [], (err) => {
  if (err) {
    return console.log('error creating table');
  }
  console.log('table created successful')
})

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// server is found and online 
app.get(('/'), (request, resolve) => {
  resolve.status(200);
  resolve.send('Server is online');
});

// get api and select the data
app.get('/listtotask', (request, resolve) => {
  // get all tasks 
  resolve.set('content-type', 'application/json');

  const sql = 'SELECT * FROM test_table';
  let data = { tasks: [] };

  try {
    // map the table (task)
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }

      // send back all tasks
      rows.forEach((row) => {
        data.tasks.push({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          title: row.title,
          description: row.description,
          category: row.category,
          deadline: row.deadline,
          isCompleted: row.isCompleted
        });
      });
      let content = JSON.stringify(data);
      resolve.send(content);
      console.log('tasks selected successfully');
    })
  }
  catch (err) {
    // error selecting tasks
    console.log('error selecting:', err.message);
    resolve.status(467);
    resolve.send(`{"code":467, "status":"${err.message}"}`)
  }
});

// add a task to the table
app.post('/addtask', (request, resolve) => {
  let req = request.body;

  // add task
  resolve.set('content-type', 'application/json');
  // need whatever the user enters - name, email, phone, title, description, category, deadline
  const sql = `INSERT INTO test_table(name, email, phone, title, description, category, deadline)
              VALUES (?, ?, ?, ?, ?, ?, ?)`;

  try {
    // run the insert command
    db.run(sql, 
      [
        req.name, req.email,
        req.phone, req.title,
        req.description, req.category,
        req.deadline
      ],
      // function to handle insert result
      function(err) {
        if (err) {
          throw err;
        }

        resolve.status(200);

        // send back the added task with its new id
        const data = { 
          id: this.lastID,
          name: req.name,
          email: req.email,
          phone: req.phone,       
          title: req.title, 
          description: req.description, 
          category: req.category, 
          deadline: req.deadline,
          isCompleted: false
        };
        const content = JSON.stringify(data);
        resolve.send(content);
        console.log('task added successfully');
      }
    );
  }
  catch (err) {
    console.log('error adding:', err.message);
    resolve.status(468);
    resolve.send(`{"code":468, "status":"${err.message}"}`);
  }
});

// complete a task in the table
app.put('/completetask', (request, resolve) => {
  let req = request.body;
  
  // complete task
  resolve.set('content-type', 'application/json');

  const sql = `UPDATE test_table 
               SET isCompleted = ? 
               WHERE id = ?`;

  try {
    // run the update command
    db.run(sql, 
      [ req.isCompleted ? 1 : 0, req.id ],
      // function to handle update result
      function(err) {
        if (err) {
          throw err;
        }
        
        resolve.status(200);
        // send back the updated task
        const data = { 
          id: req.id,
          isCompleted: req.isCompleted ? 1 : 0
        };
        const content = JSON.stringify(data);
        resolve.send(content);
        console.log('task completed update successfully');
      }
    );
  } 
  catch (err) {
    // error updating task
    console.log('error updating:', err.message);
    resolve.status(470);
    resolve.send(`{"code":470, "status":"${err.message}"}`);
  }
});

// edit a task in the table
app.put('/edittask', (request, resolve) => {
  let req = request.body;
  const keepID = req.id;
  
  // complete task
  resolve.set('content-type', 'application/json');

  const sql = `UPDATE test_table 
               SET name = ?, email = ?, phone = ?, title = ?, description = ?, category = ?, deadline = ?
               WHERE id = ?`;

  try {
    // run the update command
    db.run(sql, 
      [ req.name, req.email, 
        req.phone, req.title,
        req.description, req.category, 
        req.deadline, keepID],
      // function to handle update result
      function(err) {
        if (err) {
          throw err;
        }

        resolve.status(200);
        // send back the updated task
        const data = { 
          id: keepID,
          name: req.name,
          email: req.email,
          phone: req.phone,
          title: req.title,
          description: req.description,
          category: req.category,
          deadline: req.deadline
        };
        const content = JSON.stringify(data);
        resolve.send(content);
        console.log('task edit successful');
      }
    );
  } 
  catch (err) {
    // error updating task
    console.log('error updating:', err.message);
    resolve.status(471);
    resolve.send(`{"code":471, "status":"${err.message}"}`);
  }
});

// delete a task from the table
app.delete('/deletetask', (request, resolve) => {
  // delete task
  resolve.set('content-type', 'application/json');

  // need what task the user wants to delete - from id
  const sql = `DELETE FROM test_table 
              WHERE id = ?`;

  try {
    // run the delete command
    db.run(sql, [ request.query.id ], 
      // function to handle delete result
      function (err) {
        if (err) {
          throw err;
        }

        // check if a row was deleted
        if (this.changes === 1) {
          const data = { status: 200, message: 'Task deleted' };
          const content = JSON.stringify(data);
          resolve.send(content);
          console.log('task deleted successfully');
        }
        else {
          // no row deleted
          const data = { status: 200, message: 'Failed to delete task' };
          const content = JSON.stringify(data);
          resolve.send(content);
          console.log('no task deleted');
        }
      }
    );
  }
  catch (err) {
    // error deleting task
    console.log('error deleting:', err.message);
    resolve.status(469);
    resolve.send(`{"code":469, "status":"${err.message}"}`);
  }
});

// clear all tasks from the table
app.delete('/cleartasks', (request, resolve) => {
  // clear tasks
  resolve.set('content-type', 'application/json');
  const sql = 'DELETE FROM test_table';

  try {
    // run the delete command
    db.run(sql, [], function(err) {
      // function to handle delete result
      if (err) {
        throw err;
      }

      resolve.status(200);
      // all tasks cleared
      const data = { status: 200, message: 'All tasks cleared' };
      const content = JSON.stringify(data);
      resolve.send(content);
      console.log('all tasks cleared successfully');
    });
  }
  catch (err) {
    // error clearing tasks
    console.log('error clearing tasks:', err.message);
    resolve.status(472);
    resolve.send(`{"code":472, "status":"${err.message}"}`);
  }
});

// listen on port 5000
app.listen(5000, (err) => {
  if (err) {
    console.log('error listening:', err);
  }
  console.log('listening in progress');
})

export { db }