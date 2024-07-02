import express, {Express, Request, Response} from 'express';
import * as database from './database';
import {DatabaseRow} from "./database";

// End Imports

//Database Connection
database.connectToDatabase()

database.initTable();


const app: Express = express();
app.set("view engine", "ejs");
app.set("views", "public");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pages: string[] = [
    "addNew",
    "query",
    "modify",
    "increase",
    "decrease",
    "orderMore",
    "export",
];

app.get('/', (req: Request, res: Response) => {
    res.render("layouts/layout.ejs", { page: "../home", navlinks: pages, currentUrl: req.url });
});

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
    const item: database.DatabaseRow = {
        id: req.body.id?.toLocaleUpperCase(),
        description: req.body.description,
        quantity: req.body.quantity,
        min: req.body.min,
        max: req.body.max,
        cost: req.body.cost,
        rrp: req.body.rrp,
        wholesale: req.body.wholesale,
    }

    database.addItem(item);
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
        const items = await database.orderMore();
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
    // @ts-ignore
    const id: string = req.query.id.toString().toLocaleUpperCase()
    try {
        const item = await database.queryItem(id, undefined);
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
    database.order(id, needsOrdering)
        .then(() => res.json({ success: true }))
        .catch((err) => {
            console.error(err);
            res
                .status(500)
                .json({ error: "An error occurred while updating the order status." });
        });
});

interface Item {
    id: string;
    quantity: number;
}

app.post("/decreaseItems", async (req, res) => {
    const items = req.body.items;
    items.forEach(async (item: Item) => {
        database.decreaseItem(item.id.toLocaleUpperCase(), item.quantity);
    })

    res.status(200).type("json").json({ success: true });
});

app.post("/increaseItems", async (req, res) => {
    const items = req.body.items;
    items.forEach(async (item: Item) => {
        database.increaseItem(item.id.toLocaleUpperCase(), item.quantity);
    });

    res.status(200).type("json").json({ success: true });
});

app.post("/modifyItem", async (req, res) => {
    const mitem: DatabaseRow = {
        id: req.body.id,
        description: req.body.description,
        quantity: req.body.quantity,
        min: req.body.min,
        max: req.body.max,
        cost: req.body.cost,
        rrp: req.body.rrp,
        wholesale: req.body.wholesale
    }
    database.modifyItem(mitem);
    res.redirect("/modify");
});

app.post("/generatePdf", async (req, res) => {
    let { products } = req.body;
    //console.log(JSON.stringify(req.body));
    products = await Promise.all(
        products.map(async (product: object) => {
            try {
                return {
                    ...product,
                    description: await database.queryItem(products.id, "description"),
                    cost: await database.queryItem(products.id, "cost"),
                    retail: await database.queryItem(products.id, "retail"),
                    wholesale: await database.queryItem(products.id, "wholesale"),
                };
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "could not grab " + products.id });
            }
        })
    );
    //console.log(products);
    /*const pdfStream = await pdf.createPDF(products, type);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=export.pdf`);
    pdfStream.pipe(res);*/
});

app.listen(3000, () => {
    console.log('[server]: Listening on port 3000');
});