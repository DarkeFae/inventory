const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const { addItem, increaseItem, decreaseItem, modifyItem, orderMore, queryItem, initTable } = require('./database.js')

const db = new sqlite3.Database('db/inventory.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
        return;
    }
    console.log('Connected to the database.');
});

initTable();


app.set('view engine', 'ejs');
app.set('views', 'public');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const pages = ['addNew', 'query', 'modify', 'increase', 'decrease', 'orderMore'];

app.get('/', (req, res) => {
  res.render('layouts/layout.ejs', { page: "../home", navlinks: pages});
});

/* Add routes for user to interact with. */
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.render('layouts/layout', { page: `../${page}`, navlinks: pages });
    });
});

/* Add routes db interactions */
app.post('/addNewItem', (req, res) => {
    const { id, description, quantity, min, max, cost, rrp, wholesale } = req.body;
    addItem(id, description, quantity, min, max, cost, rrp, wholesale);
    res.redirect(200 ,'/');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});