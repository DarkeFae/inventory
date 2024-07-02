import * as sqlite3 from "sqlite3";

/* Interfaces */
export interface DatabaseRow {
    id?: string;
    description?: string;
    quantity?: number;
    min?: number;
    max?: number;
    cost?: number;
    rrp?: number;
    wholesale?: number;
    supplier?: string;
    supplierid?: string;
    specs?: string;
    needsOrdering?: number;
}

interface queryItem {
    row: DatabaseRow;
}


//Database connection
export function connectToDatabase(): sqlite3.Database {
    return new sqlite3.Database('db/inventory.db', (err: Error | null) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Connected to the SQlite3 database.');
    });
}

export function addItem(item: DatabaseRow) {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });

    const sql = `INSERT INTO stock (id, description, supplier, supplierid, specs, quantity, min, max, cost, rrp, wholesale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        sql,
        [item.id, item.description, item.supplier, item.supplierid, item.specs, item.quantity, item.min, item.max, item.cost, item.rrp, item.wholesale],
        (err) => {
            if (err) {
                console.error("Database insertion error: ", err);
                return;
            }
            console.log("Row inserted.");
        }
    );
    db.close()
}

export function increaseItem(id: string, increaseAmount: number) {
    const db = connectToDatabase();

        const selectSql = `SELECT quantity, min FROM stock WHERE id = ?`;
        db.get(selectSql, [id], (err, row: DatabaseRow) => {
            if (err) {
                console.error("Database selection error: ", err);
                return;
            }
            //console.log(JSON.stringify(row))
            const newQuantity: number = Number(row.quantity) + Number(increaseAmount);
            console.log("New quantity: ", newQuantity);
            if (row.min!= undefined && newQuantity >= row.min) {
                const updateSql = `UPDATE stock SET quantity = ?, needsOrdering = 0 WHERE id = ?`;
                db.run(updateSql, [newQuantity, id], (err) => {
                    if (err) {
                        console.error("Database update error: ", err);
                        return;
                    }
                    console.log("Row updated.");
                });
            } else {
                const updateSql = `UPDATE stock SET quantity = ? WHERE id = ?`;
                db.run(updateSql, [newQuantity, id], (err) => {
                    if (err) {
                        console.error("Database update error: ", err);
                        return;
                    }
                    console.log("Row updated.");
                });
            }
        });
    db.close();
}

export function decreaseItem(id: string, decreaseAmount: number) {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");

        const selectSql = `SELECT quantity, min FROM stock WHERE id = ?`;
        db.get(selectSql, [id], (err, row: DatabaseRow) => {
            if (err) {
                console.error("Database selection error: ", err);
                return;
            }
            //console.log(JSON.stringify(row))
            const newQuantity = Number(row.quantity) - Number(decreaseAmount);
            console.log("New quantity: ", newQuantity);
            if (row.min != undefined && newQuantity <= row.min) {
                const updateSql = `UPDATE stock SET quantity = ?, needsOrdering = 1 WHERE id = ?`;
                db.run(updateSql, [newQuantity, id], (err) => {
                    if (err) {
                        console.error("Database update error: ", err);
                        return;
                    }
                    console.log("Row updated.");
                });
            } else {
                const updateSql = `UPDATE stock SET quantity = ? WHERE id = ?`;
                db.run(updateSql, [newQuantity, id], (err) => {
                    if (err) {
                        console.error("Database update error: ", err);
                        return;
                    }
                    console.log("Row updated.");
                });
            }
        });
    });
}

export function modifyItem(item: DatabaseRow) {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });

    const sql = `UPDATE stock SET description = ?, quantity = ?, supplier = ?, supplierid = ?, specs = ? min = ?, max = ?, cost = ?, rrp = ?, wholesale = ? WHERE id = ?`;

    db.run(
        sql,
        [item.description, item.quantity, item.supplier, item.supplierid, item.specs, item.min, item.max, item.cost, item.rrp, item.wholesale, item.id],
        (err) => {
            if (err) {
                console.error("Database update error: ", err);
                return;
            }
            console.log("Row updated.");
        }
    );
}

export function orderMore() {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });

    const sql = `SELECT * FROM stock WHERE quantity <= min AND needsOrdering = 1`;

    return new Promise((resolve, reject) => {
         db.all(sql, [], (err, rows: []) => {
            if (err) {
                console.error("Database query error: ", err);
                reject(err);
            } else  if (rows.length > 0) {
                console.log("Rows found.")
                resolve(rows);
            } else {
                resolve([]);
            }
             db.close();
        });
    });

}

export function order(id: string, needsOrdering: boolean) {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });

    const sql = `UPDATE stock SET needsOrdering = ? WHERE id = ?`;

    return new Promise<void>((resolve, reject) => {
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

export async function queryItem(id: string, price: string | undefined) {
     let db: sqlite3.Database = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });

    const sql = `SELECT * FROM stock WHERE id = ?`;
    let item: queryItem = {
        row: {/*
            id: "",
            description: "",
            supplier: "",
            supplierid: "",
            specs: "",
            quantity: 0,
            min: 0,
            max: 0,
            cost: 0,
            rrp: 0,
            wholesale: 0,*/
        },
    };

    return new Promise((resolve, reject) => {
        db.get(sql, [id], (err, row: DatabaseRow) => {
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

            //console.log(item);
            try {
                switch (price) {
                    case "retail": resolve(item.row.rrp);
                        break;
                    case "wholesale": resolve(item.row.wholesale);
                        break;
                    case "description": resolve(item.row.description);
                        break;
                    case "cost": resolve(item.row.cost);
                        break;
                    default: resolve(item);
                }
            } catch (err) {
                reject(err);
            }
            db.close();
        });
    });
}

export function initTable() {
    const tableName = "stock"; // replace with your table name

    let db = new sqlite3.Database("db/inventory.db", (err) => {
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
                    "CREATE TABLE IF NOT EXISTS stock (id TEXT UNIQUE PRIMARY KEY, description TEXT, supplier TEXT, supplierid TEXT, specs TEXT, quantity INTEGER, min INTEGER, max INTEGER, cost REAL, rrp REAL, wholesale REAL, needsOrdering BOOLEAN DEFAULT 0)",
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