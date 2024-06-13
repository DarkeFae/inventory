const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const { addItem, increaseItem, decreaseItem, modifyItem, orderMore, queryItem, initTable, order } = require('./database.js')

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
    res.render('layouts/layout.ejs', { page: "../home", navlinks: pages });
});

/* Add routes for user to interact with. */
pages.forEach(page => {
    if (page !== 'query' && page !== 'orderMore') {
        app.get(`/${page}`, (req, res) => {
            res.render('layouts/layout', { page: `../${page}`, navlinks: pages });
        });
    }
});

/* Add routes db interactions */
app.post('/addNewItem', (req, res) => {
    const { id, description, quantity, min, max, cost, rrp, wholesale } = req.body;
    addItem(id.toLocaleUpperCase(), description, quantity, min, max, cost, rrp, wholesale);
    res.redirect('/addNew');
});

app.get('/query', (req, res) => {
    res.render('layouts/layout', { page: `../query`, navlinks: pages });
});

app.get('/orderMore', async (req, res) => {
    try {
        const items = await orderMore();
        res.render('layouts/layout', { page: `../orderMore`, navlinks: pages, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying items.' });
    }
});
/* Database Queries and Modifications */
app.get('/queryItem', async (req, res) => {
    const id = req.query.id;
    try {
        const item = await queryItem(id.toLocaleUpperCase());
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the item.' });
    }
});

app.post('/order', (req, res) => {
    const { id, needsOrdering } = req.body;
    order(id, needsOrdering)
      .then(() => res.json({ success: true }))
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating the order status.' });
      });
  });

app.post('/decreaseItems', async (req, res) => {
    const items = req.body;
    console.log(items);
    res.status(200).type('json').json({ success: true });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});