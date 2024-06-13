const res = require("express/lib/response");
const sqlite3 = require("sqlite3");

function addItem(id, description, quantity, min, max, cost, rrp, wholesale) {
  let db = new sqlite3.Database("db/inventory.db", (err) => {
    if (err) {
      console.error("Database opening error: ", err);
      return;
    }
    console.log("Connected to the database.");
  });

  const sql = `INSERT INTO stock (id, description, quantity, min, max, cost, rrp, wholesale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [id, description, quantity, min, max, cost, rrp, wholesale], (err) => {
    if (err) {
      console.error('Database insertion error: ', err);
      return;
    }
    console.log('Row inserted.');
  });
}

function increaseItem() { }

function decreaseItem() { }

function modifyItem() { }

function orderMore() {
  let db = new sqlite3.Database("db/inventory.db", (err) => {
    if (err) {
      console.error("Database opening error: ", err);
      return;
    }
    console.log("Connected to the database.");
  });

  const sql = `SELECT * FROM stock WHERE quantity < min AND needsOrdering = 1`;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Database query error: ", err);
        reject(err);
      }

      if (rows && rows.length > 0) {
        resolve(rows);
      } else {
        resolve([]);
      }
      });
    db.close();
  });
}

function order(id, needsOrdering) {
  let db = new sqlite3.Database("db/inventory.db", (err) => {
    if (err) {
      console.error("Database opening error: ", err);
      return;
    }
    console.log("Connected to the database.");
  });

  const sql = `UPDATE stock SET needsOrdering = ? WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db.run(sql, [needsOrdering, id], (err) => {
      if (err) {
        console.error("Database update error: ", err);
        reject(err);
        return;
      }
      console.log(`Updated 'needsOrdering' for item with ID ${id}.`);
      resolve();
    });

    db.close();
  });
}

async function queryItem(id) {
  let db = new sqlite3.Database("db/inventory.db", (err) => {
    if (err) {
      console.error("Database opening error: ", err);
      return;
    }
    console.log("Connected to the database.");
  });

  const sql = `SELECT * FROM stock WHERE id = ?`;
  let item = {}

  return new Promise((resolve, reject) => {
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error("Database query error: ", err);
        reject(err);
        return;
      }

      if (row) {
        item.row = row;
      } else {
        console.log("Row not found.");
      }

      console.log(item);
      resolve(item);
      db.close();
    });
  });
}

function initTable() {

  const tableName = "stock"; // replace with your table name

  db = new sqlite3.Database("db/inventory.db", (err) => {
    if (err) {
      console.error("Database opening error: ", err);
      return;
    }
  });

  db.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [tableName],
    (err, row) => {
      if (err) {
        console.error("Database query error: ", err);
        return;
      }

      if (row) {
        console.log(`Table ${tableName} exists.`);
      } else {
        db.run(
          "CREATE TABLE IF NOT EXISTS stock (id TEXT UNIQUE PRIMARY KEY, description TEXT, quantity INTEGER, min INTEGER, max INTEGER, cost REAL, rrp REAL, wholesale REAL)",
          (err) => {
            if (err) {
              console.error("Table creation error: ", err);
            }
            console.log("Table created.");

          }
        );
      }
    }
  );
  db.close();
}

module.exports = {
  addItem,
  increaseItem,
  decreaseItem,
  modifyItem,
  orderMore,
  queryItem,
  initTable,
  order,
};
