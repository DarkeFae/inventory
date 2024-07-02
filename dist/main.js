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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database = __importStar(require("./database"));
// End Imports
//Database Connection
database.connectToDatabase();
database.initTable();
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.set("views", "public");
app.use(express_1.default.static("public"));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
const pages = [
    "addNew",
    "query",
    "modify",
    "increase",
    "decrease",
    "orderMore",
    "export",
];
app.get('/', (req, res) => {
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
    var _a;
    const item = {
        id: (_a = req.body.id) === null || _a === void 0 ? void 0 : _a.toLocaleUpperCase(),
        description: req.body.description,
        quantity: req.body.quantity,
        min: req.body.min,
        max: req.body.max,
        cost: req.body.cost,
        rrp: req.body.rrp,
        wholesale: req.body.wholesale,
    };
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
app.get("/orderMore", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield database.orderMore();
        res.render("layouts/layout", {
            page: `../orderMore`,
            navlinks: pages,
            items,
            currentUrl: req.url,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while querying items." });
    }
}));
/* Database Queries and Modifications */
app.get("/queryItem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.query.id.toString().toLocaleUpperCase();
    try {
        const item = yield database.queryItem(id, undefined);
        res.json(item);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: "An error occurred while querying the item." });
    }
}));
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
app.post("/decreaseItems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = req.body.items;
    items.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
        yield database.decreaseItem(item.id.toLocaleUpperCase(), item.quantity);
    }));
    res.status(200).type("json").json({ success: true });
}));
app.post("/increaseItems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = req.body.items;
    items.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
        yield database.increaseItem(item.id.toLocaleUpperCase(), item.quantity);
    }));
    res.status(200).type("json").json({ success: true });
}));
app.post("/modifyItem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mitem = {
        id: req.body.id,
        description: req.body.description,
        quantity: req.body.quantity,
        min: req.body.min,
        max: req.body.max,
        cost: req.body.cost,
        rrp: req.body.rrp,
        wholesale: req.body.wholesale
    };
    database.modifyItem(mitem);
    res.redirect("/modify");
}));
app.post("/generatePdf", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { products, type } = req.body;
    //console.log(JSON.stringify(req.body));
    products = yield Promise.all(products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return Object.assign(Object.assign({}, product), { description: yield database.queryItem(products.id, "description"), cost: yield database.queryItem(products.id, "cost"), retail: yield database.queryItem(products.id, "retail"), wholesale: yield database.queryItem(products.id, "wholesale") });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "could not grab " + products.id });
        }
    })));
    //console.log(products);
    /*const pdfStream = await pdf.createPDF(products, type);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=export.pdf`);
    pdfStream.pipe(res);*/
}));
app.listen(3000, () => {
    console.log('[server]: Listening on port 3000');
});
