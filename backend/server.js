import sqlite3 from 'sqlite3'

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
  CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
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

// run backend server - fastify does same thing
import express from 'express';

import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// server is found and online 
app.get(('/'), (request, resolve) => {
  resolve.status(200); // notifcation for work successfully
  resolve.send('Server is online');
});

// get api and select the data
app.get('/api', (request, resolve) => {
  // get all tasks 
  resolve.set('content-type', 'application/json');

  const sql = 'SELECT * FROM tasks';
  let data = { tasks: [] };

  try {
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      // maps the table (task)
      rows.forEach((row) => {
        data.tasks.push({
          id: row.task_id,
          title: row.task_title,
          description: row.task_description,
          category: row.task_category,
          deadline: row.task_deadline,
          isCompleted: row.task_completed
        });
      });
      
      let content = JSON.stringify(data);
      resolve.send(content);
    })
  }
  catch (err) {
    console.log('error selecting:', err);
    resolve.status(467);
    resolve.send(`{"code":467, "status":"${err.message}"}`)
  }
});

// add a task to the table
app.post('/api', (request, resolve) => {
  console.log(request.body);

  // add task
  resolve.set('content-type', 'application/json');

  // need whatever the user enters -  title, description, category, deadline
  const sql = 'INSERT INTO tasks(title, description, category, deadline) VALUES (?, ?, ?, ?)';

  try {
    db.run(sql, 
      [
        request.body.title, 
        request.body.description, 
        request.body.category, 
        request.body.deadline
      ], 
      function(err) {
        if (err) {
          throw err;
        }

        resolve.status(201);
        let data = {status: 201, message:'New task saved'};
        let content = JSON.stringify(data);
        resolve.send(content);
      }
    );
  }
  catch (err) {
    console.log('error adding:', err.message);
    resolve.status(468);
    resolve.send(`{"code":468, "status":"${err.message}"}`);
  }
});

// delete a task from the table
app.delete('/api', (request, resolve) => {

});

app.listen(5000, (err) => {
  if (err) {
    console.log('error listening:', err);
  }
  console.log('listening in progress');
})

export { db }