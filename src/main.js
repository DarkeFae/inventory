const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const {
  addItem,
  increaseItem,
  decreaseItem,
  modifyItem,
  orderMore,
  queryItem,
  initTable,
  order,
} = require("./database.js");
const { createPDF } = require("./pdf.js");

const router = express.Router();

const db = new sqlite3.Database("db/inventory.db", (err) => {
  if (err) {
    console.error("Database opening error: ", err);
    return;
  }
  console.log("Connected to the database.");
});

initTable();

app.set("view engine", "ejs");
app.set("views", "public");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pages = [
  "addNew",
  "query",
  "modify",
  "increase",
  "decrease",
  "orderMore",
  "export",
];

app.get("/", (req, res) => {
  res.render("layouts/layout.ejs", {
    page: "../home",
    navlinks: pages,
    currentUrl: req.url,
  });
});

/* Add routes for user to interact with. */
pages.forEach((page) => {
  if (page !== "query" && page !== "orderMore") {
    app.get(`/${page}`, (req, res) => {
      res.render("layouts/layout", {
        page: `../${page}`,
        navlinks: pages,
        currentUrl: req.url,
      });
    });
  }
});

/* Add routes db interactions */
app.post("/addNewItem", (req, res) => {
  const { id, description, quantity, min, max, cost, rrp, wholesale } =
    req.body;
  addItem(
    id.toLocaleUpperCase(),
    description,
    quantity,
    min,
    max,
    cost,
    rrp,
    wholesale
  );
  res.redirect("/addNew");
});

app.get("/query", (req, res) => {
  res.render("layouts/layout", {
    page: `../query`,
    navlinks: pages,
    currentUrl: req.url,
  });
});

app.get("/orderMore", async (req, res) => {
  try {
    const items = await orderMore();
    res.render("layouts/layout", {
      page: `../orderMore`,
      navlinks: pages,
      items,
      currentUrl: req.url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while querying items." });
  }
});
/* Database Queries and Modifications */
app.get("/queryItem", async (req, res) => {
  const id = req.query.id;
  try {
    const item = await queryItem(id.toLocaleUpperCase());
    res.json(item);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while querying the item." });
  }
});

app.post("/order", (req, res) => {
  const { id, needsOrdering } = req.body;
  order(id, needsOrdering)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while updating the order status." });
    });
});

app.post("/decreaseItems", async (req, res) => {
  const items = req.body.items;
  items.forEach(async (item) => {
    await decreaseItem(item.id.toLocaleUpperCase(), item.quantity);
  });

  res.status(200).type("json").json({ success: true });
});

app.post("/increaseItems", async (req, res) => {
  const items = req.body.items;
  items.forEach(async (item) => {
    await increaseItem(item.id.toLocaleUpperCase(), item.quantity);
  });

  res.status(200).type("json").json({ success: true });
});

app.post("/modifyItem", async (req, res) => {
  const { id, description, quantity, min, max, cost, rrp, wholesale } =
    req.body;
  console.log(id, description, quantity, min, max, cost, rrp, wholesale);
  modifyItem(
    id.toLocaleUpperCase(),
    description,
    quantity,
    min,
    max,
    cost,
    rrp,
    wholesale
  );
  res.redirect("/modify");
});

app.post("/generatePdf", async (req, res) => {
  let { products, type } = req.body;
  //console.log(JSON.stringify(req.body));
  products = await Promise.all(
    products.map(async (product) => {
      try {
        return {
      ...product,
      description: await queryItem(product.id, "description"),
      cost: await queryItem(product.id, "cost"),
      retail: await queryItem(product.id, "retail"),
      wholesale: await queryItem(product.id, "wholesale"),
        };
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "could not grab " + product.id });
  }
})
  );
  //console.log(products);
  const pdfStream = await createPDF(products, type);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=export.pdf`);
  pdfStream.pipe(res);  
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
