"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.addItem = addItem;
exports.increaseItem = increaseItem;
exports.decreaseItem = decreaseItem;
exports.modifyItem = modifyItem;
exports.orderMore = orderMore;
exports.order = order;
exports.queryItem = queryItem;
exports.initTable = initTable;
const sqlite3 = __importStar(require("sqlite3"));
//Database connection
function connectToDatabase() {
    return new sqlite3.Database('db/inventory.db', (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Connected to the SQlite3 database.');
    });
}
function addItem(item) {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });
    const sql = `INSERT INTO stock (id, description, supplier, supplierid, specs, quantity, min, max, cost, rrp, wholesale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [item.id, item.description, item.supplier, item.supplierid, item.specs, item.quantity, item.min, item.max, item.cost, item.rrp, item.wholesale], (err) => {
        if (err) {
            console.error("Database insertion error: ", err);
            return;
        }
        console.log("Row inserted.");
    });
    db.close();
}
function increaseItem(id, increaseAmount) {
    const db = connectToDatabase();
    const selectSql = `SELECT quantity, min FROM stock WHERE id = ?`;
    db.get(selectSql, [id], (err, row) => {
        if (err) {
            console.error("Database selection error: ", err);
            return;
        }
        //console.log(JSON.stringify(row))
        const newQuantity = Number(row.quantity) + Number(increaseAmount);
        console.log("New quantity: ", newQuantity);
        if (row.min != undefined && newQuantity >= row.min) {
            const updateSql = `UPDATE stock SET quantity = ?, needsOrdering = 0 WHERE id = ?`;
            db.run(updateSql, [newQuantity, id], (err) => {
                if (err) {
                    console.error("Database update error: ", err);
                    return;
                }
                console.log("Row updated.");
            });
        }
        else {
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
function decreaseItem(id, decreaseAmount) {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
        const selectSql = `SELECT quantity, min FROM stock WHERE id = ?`;
        db.get(selectSql, [id], (err, row) => {
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
            }
            else {
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
function modifyItem(item) {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });
    const sql = `UPDATE stock SET description = ?, quantity = ?, supplier = ?, supplierid = ?, specs = ? min = ?, max = ?, cost = ?, rrp = ?, wholesale = ? WHERE id = ?`;
    db.run(sql, [item.description, item.quantity, item.supplier, item.supplierid, item.specs, item.min, item.max, item.cost, item.rrp, item.wholesale, item.id], (err) => {
        if (err) {
            console.error("Database update error: ", err);
            return;
        }
        console.log("Row updated.");
    });
}
function orderMore() {
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
        console.log("Connected to the database.");
    });
    const sql = `SELECT * FROM stock WHERE quantity <= min AND needsOrdering = 1`;
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Database query error: ", err);
                reject(err);
            }
            else if (rows.length > 0) {
                console.log("Rows found.");
                resolve(rows);
            }
            else {
                resolve([]);
            }
            db.close();
        });
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
function queryItem(id, price) {
    return __awaiter(this, void 0, void 0, function* () {
        let db = new sqlite3.Database("db/inventory.db", (err) => {
            if (err) {
                console.error("Database opening error: ", err);
                return;
            }
            console.log("Connected to the database.");
        });
        const sql = `SELECT * FROM stock WHERE id = ?`;
        let item = {
            row: { /*
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
                wholesale: 0,*/},
        };
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error("Database query error: ", err);
                    reject(err);
                    return;
                }
                if (row) {
                    item.row = row;
                }
                else {
                    console.log("Row not found.");
                }
                //console.log(item);
                try {
                    switch (price) {
                        case "retail":
                            resolve(item.row.rrp);
                            break;
                        case "wholesale":
                            resolve(item.row.wholesale);
                            break;
                        case "description":
                            resolve(item.row.description);
                            break;
                        case "cost":
                            resolve(item.row.cost);
                            break;
                        default: resolve(item);
                    }
                }
                catch (err) {
                    reject(err);
                }
                db.close();
            });
        });
    });
}
function initTable() {
    const tableName = "stock"; // replace with your table name
    let db = new sqlite3.Database("db/inventory.db", (err) => {
        if (err) {
            console.error("Database opening error: ", err);
            return;
        }
    });
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
        if (err) {
            console.error("Database query error: ", err);
            return;
        }
        if (row) {
            console.log(`Table ${tableName} exists.`);
        }
        else {
            db.run("CREATE TABLE IF NOT EXISTS stock (id TEXT UNIQUE PRIMARY KEY, description TEXT, supplier TEXT, supplierid TEXT, specs TEXT, quantity INTEGER, min INTEGER, max INTEGER, cost REAL, rrp REAL, wholesale REAL, needsOrdering BOOLEAN DEFAULT 0)", (err) => {
                if (err) {
                    console.error("Table creation error: ", err);
                }
                console.log("Table created.");
            });
        }
    });
    db.close();
}
